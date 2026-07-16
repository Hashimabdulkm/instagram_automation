import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { sendInstagramDM, replyToComment, getInstagramUserInfo } from "../../../../lib/instagram";
import { decryptString, verifyInstagramSignature } from "@/lib/crypto";
import { MessageEvent, parseInstagramWebhook, processWebhook, safeParseInstagramWebhook } from "@/lib/instagram-webhookschema";
import { startWebhookWorkflow } from "@/lib/temporal-client";

// GET: Webhook verification (Meta challenge)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");


  if (mode === "subscribe" && token === process.env.IG_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  console.warn("[IG Webhook][GET] verification failed", { mode, tokenMatches: token === process.env.IG_WEBHOOK_VERIFY_TOKEN });
  return new NextResponse("Forbidden", { status: 403 });
}

// POST: Receive webhook events
// IMPORTANT: Always returns 200 status to prevent Instagram from disabling the webhook
export async function POST(request: Request) {
  try {
    // Verify client certificate CN (mTLS verification)
    const clientCertSubject = request.headers.get("X-Client-Cert-Subject");
    if (clientCertSubject && !clientCertSubject.includes("CN=client.webhooks.fbclientcerts.com")) {
      console.warn("[IG Webhook][POST] Invalid client certificate CN:", clientCertSubject);
      // Still return 200 to prevent webhook deactivation, but don't process
      return NextResponse.json({ ok: false, error: "Invalid client certificate" }, { status: 200 });
    }

    if (clientCertSubject) {
      console.log("[IG Webhook][POST] Client certificate CN verified:", clientCertSubject);
    }

    // Get raw request body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("X-Hub-Signature-256");

    // Verify payload signature if signature is provided
    if (signature && process.env.INSTAGRAM_CLIENT_SECRET) {
      const isValidSignature = await verifyInstagramSignature(
        rawBody,
        signature,
        process.env.INSTAGRAM_CLIENT_SECRET
      );

      if (!isValidSignature) {
        console.warn("[IG Webhook][POST] Invalid signature - potential security threat");
        // Still return 200 to prevent webhook deactivation, but don't process
        return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 200 });
      }

      console.log("[IG Webhook][POST] Payload signature verified successfully");
    } else if (signature && !process.env.INSTAGRAM_CLIENT_SECRET) {
      console.warn("[IG Webhook][POST] Signature provided but INSTAGRAM_CLIENT_SECRET not configured");
    } else {
      console.log("[IG Webhook][POST] No signature provided - skipping verification");
    }

    // Parse the verified payload
    const payload = JSON.parse(rawBody);

    // Parse and validate webhook - if invalid, still return 200
    try {
      const webhook = parseInstagramWebhook(payload);

      // Start Temporal workflow to process the webhook (non-blocking)
      try {
        const workflowId = await startWebhookWorkflow(webhook);
        console.log(`[IG Webhook][POST] Started workflow ${workflowId} to process webhook`);
      } catch (workflowError) {
        // Log workflow start error but still acknowledge webhook receipt
        console.error("[IG Webhook][POST] Failed to start workflow:", workflowError);
      }
    } catch (validationError) {
      // Log validation error but still acknowledge webhook receipt
      console.error("[IG Webhook][POST] Webhook validation failed:", validationError);
    }

    // Always return 200 OK to Instagram
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // Catch-all for any unexpected errors (e.g., JSON parsing)
    console.error("[IG Webhook][POST] Unexpected error:", error);
    // Still return 200 to prevent webhook deactivation
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}

async function createLeadNotification(userId: string, automationId: string, leadId: string, triggerType: string, message: string, campaignName: string, businessId: string) {
  try {
    // Get the integration to fetch user info
    const integration = await client.integrations.findFirst({ where: { instagramId: businessId } });
    let leadName = leadId; // fallback to ID

    if (integration?.token && leadId) {
      try {
        const accessToken = await decryptString(integration.token);
        const userInfo = await getInstagramUserInfo(leadId, accessToken);
        leadName = userInfo.username || userInfo.name || leadId;
      } catch (error) {
        console.error("[IG Webhook] Failed to fetch user info:", error);
        // Continue with fallback name
      }
    }

    await client.leadNotifications.create({
      data: {
        userId,
        automationId,
        leadId,
        leadName,
        triggerType,
        message,
        campaignName,
      }
    });
  } catch (error) {
    console.error("[IG Webhook] Failed to create lead notification:", error);
  }
}

async function handleIncomingTextDM(userId: string, businessId: string, fromId: string | undefined, text: string) {
  console.log("[IG Webhook] Processing DM:", { userId, businessId, fromId, text });

  // First, check if this is a catalog request (independent of automations)
  const catalogKeywords = ["catalog", "products", "shop", "buy", "store", "items", "menu", "browse", "services"];
  const isCatalogRequest = catalogKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );

  console.log("[IG Webhook] Catalog check:", { isCatalogRequest, text, catalogKeywords });

  if (isCatalogRequest && fromId) {
    console.log("[IG Catalog] Detected catalog request:", text);
    try {
      const catalogUrl = `${process.env.NEXTAUTH_URL}/api/instagram/send-categories`;
      console.log("[IG Catalog] Calling:", catalogUrl);

      const response = await fetch(catalogUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          toUserId: fromId
        })
      });

      console.log("[IG Catalog] Response status:", response.status);

      if (response.ok) {
        console.log("[IG Catalog] Successfully sent catalog");
        // Create a generic lead notification for catalog requests
        await createLeadNotification(userId, "catalog-system", fromId, "dm", text, "Catalog Request", businessId);
        return; // Exit early, don't process regular automations
      } else {
        console.error("[IG Catalog] Failed to send catalog:", response.status);
        const errorText = await response.text();
        console.error("[IG Catalog] Error response:", errorText);
      }
    } catch (error) {
      console.error("[IG Catalog] Error sending catalog:", error);
    }
  }

  // Load active DM automations for user (only if not a catalog request)
  const automations = await client.automations.findMany({
    where: {
      userId,
      active: true,
      trigger: { some: { type: "dm" } },
    },
    include: { keywords: true, listener: true },
  });

  for (const automation of automations) {
    const words = (automation.keywords || []).map((k) => k.word.toLowerCase());
    const matches = words.length === 0 || words.some((w) => text.toLowerCase().includes(w));

    if (!matches) continue;

    const listener = automation.listener?.[0];
    if (!listener) continue;

    if (listener.listener === "MESSAGE") {
      const reply = listener.commendReply || "";
      if (reply && fromId) {
        // Create job first
        const job = await (client as any).replyJob.create({
          data: {
            userId,
            automationId: automation.id,
            businessId,
            toUserId: fromId,
            triggerType: "dm",
            originalText: text,
            message: reply,
            status: "pending",
          },
        })

        // Try immediate send once; on failure keep job for retry
        try {
          await sendInstagramDM({ businessId, toUserId: fromId, text: reply });
          await (client as any).replyJob.update({ where: { id: job.id }, data: { status: "sent", attempts: { increment: 1 } } });
          await createLeadNotification(userId, automation.id, fromId, "dm", text, automation.name, businessId);
        } catch (error: any) {
          await (client as any).replyJob.update({
            where: { id: job.id },
            data: {
              status: "pending",
              attempts: { increment: 1 },
              lastError: String(error?.message || error || "send failed"),
              nextAttemptAt: new Date(Date.now() + 60 * 1000), // retry in 1 min
            },
          })
          console.error("[IG DM] Failed to send DM:", error);
        }
      }
    } else if (listener.listener === "SMARTAI") {
      // TODO: integrate AI model provider to generate reply from listener.prompt

      // Create lead notification for AI responses too
      if (fromId) {
        await createLeadNotification(userId, automation.id, fromId, "dm", text, automation.name, businessId);
      }
    }
  }
}

async function handleIncomingComment(userId: string, businessId: string, fromId: string | undefined, text: string, commentId: string | undefined) {
  const automations = await client.automations.findMany({
    where: {
      userId,
      active: true,
      trigger: { some: { type: "comment" } },
    },
    include: { keywords: true, listener: true },
  });

  for (const automation of automations) {
    const words = (automation.keywords || []).map((k) => k.word.toLowerCase());
    const matches = words.length === 0 || words.some((w) => text.toLowerCase().includes(w));

    if (!matches) continue;

    const listener = automation.listener?.[0];
    if (!listener) continue;

    if (listener.listener === "MESSAGE") {
      const commentReply = listener.commentReply || "";
      const dmReply = listener.commendReply || "";

      // Get the integration to get the access token
      const integration = await client.integrations.findFirst({ where: { instagramId: businessId } });

      // Create jobs for comment reply and DM
      // Comment reply job (best-effort, uses page access token flow)
      if (commentReply && commentId && integration?.token) {
        const job = await (client as any).replyJob.create({
          data: {
            userId,
            automationId: automation.id,
            businessId,
            toUserId: fromId || "",
            triggerType: "comment",
            commentId: commentId,
            originalText: text,
            message: commentReply,
            status: "pending",
          },
        })
        try {
          const accessToken = await decryptString(integration.token);
          await replyToComment(commentId, commentReply, accessToken);
          await (client as any).replyJob.update({ where: { id: job.id }, data: { status: "sent", attempts: { increment: 1 } } });
        } catch (error: any) {
          await (client as any).replyJob.update({
            where: { id: job.id },
            data: {
              status: "pending",
              attempts: { increment: 1 },
              lastError: String(error?.message || error || "comment send failed"),
              nextAttemptAt: new Date(Date.now() + 60 * 1000),
            },
          })
          console.error("[IG Comment] Comment reply failed:", error);
        }
      }

      // DM job
      if (dmReply && fromId) {
        const job = await (client as any).replyJob.create({
          data: {
            userId,
            automationId: automation.id,
            businessId,
            toUserId: fromId,
            triggerType: "dm",
            originalText: text,
            message: dmReply,
            status: "pending",
          },
        })
        try {
          await sendInstagramDM({ businessId, toUserId: fromId, text: dmReply });
          await (client as any).replyJob.update({ where: { id: job.id }, data: { status: "sent", attempts: { increment: 1 } } });
        } catch (error: any) {
          await (client as any).replyJob.update({
            where: { id: job.id },
            data: {
              status: "pending",
              attempts: { increment: 1 },
              lastError: String(error?.message || error || "dm send failed"),
              nextAttemptAt: new Date(Date.now() + 60 * 1000),
            },
          })
          console.error("[IG Comment] DM failed after comment:", error);
        }
      }

      // Create lead notification for comment triggers
      if (fromId) {
        await createLeadNotification(userId, automation.id, fromId, "comment", text, automation.name, businessId);
      }
    } else if (listener.listener === "SMARTAI") {
      // TODO: integrate AI model provider to generate reply from listener.prompt
    }
  }
}

async function handleIncomingPostback(userId: string, businessId: string, fromId: string, postback: any) {
  try {
    const payload = postback?.payload;
    if (!payload) return;

    // Parse the payload to determine the action
    let payloadData;
    try {
      payloadData = JSON.parse(payload);
    } catch (error) {
      console.error("[IG Postback] Invalid payload format:", payload);
      return;
    }

    const { action } = payloadData;

    if (action === "select_category" || action === "select_subcategory" || action === "show_categories") {
      // Forward to catalog handler
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/instagram/catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          toUserId: fromId,
          payload
        })
      });

      if (!response.ok) {
        console.error("[IG Postback] Catalog handler failed:", response.status);
      }
    }
  } catch (error) {
    console.error("[IG Postback] Error handling postback:", error);
  }
}


