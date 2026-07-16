import { client } from "@/lib/prisma";
import { decryptString } from "@/lib/crypto";
import { processWebhook } from "@/lib/instagram-webhookschema";
import { InstagramService } from "@/lib/services/instagram-service";

// Initialize Instagram service with default configuration
const instagramService = new InstagramService();

// ============================================================================
// Database Activities
// ============================================================================

export async function getIntegrationByInstagramId(instagramId: string) {
  try {
    const result = await client.integrations.findFirst({
      where: { instagramId },
    });
    return result;
  } catch (error) {
    console.error(`[Activity] Failed to fetch integration:`, error);
    throw error;
  }
}

export async function processWebhookPayload(payload: any) {
  return processWebhook(payload);
}

export async function getUserAutomations(userId: string, triggerType: 'dm' | 'comment') {
  return await client.automations.findMany({
    where: {
      userId,
      active: true,
      trigger: { some: { type: triggerType } },
    },
    include: {
      keywords: true,
      listener: true
    },
  });
}

export async function createLeadNotification(data: {
  userId: string;
  automationId: string;
  leadId: string;
  leadName: string;
  triggerType: string;
  message: string;
  campaignName: string;
}) {
  try {
    await client.leadNotifications.create({ data });
  } catch (error) {
    console.error("[Activity] Failed to create lead notification:", error);
    throw error;
  }
}


// ============================================================================
// Instagram API Activities
// ============================================================================

export async function fetchInstagramUserInfo(userId: string, encryptedToken: string) {
  try {
    const accessToken = await decryptString(encryptedToken);
    return await instagramService.getUserInfo(accessToken, userId);
  } catch (error) {
    console.error("[Activity] Failed to fetch Instagram user info:", error);
    throw error;
  }
}

export async function sendDM(businessId: string, toUserId: string, text: string) {
  try {
    // Get access token for this business account
    const integration = await client.integrations.findFirst({ where: { instagramId: String(businessId) } })

    if (!integration?.token) {
      throw new Error("no access token for business id")
    }

    // Decrypt the token before using it
    const accessToken = await decryptString(integration.token)
    const result = await instagramService.sendDM(accessToken, businessId, toUserId, text);
    return result;
  } catch (error) {
    console.error("[Activity] Failed to send DM:", error);
    throw error;
  }
}

export async function sendCommentDM(businessId: string, commentId: string, text: string) {
  try {
    // Get access token for this business account
    const integration = await client.integrations.findFirst({ where: { instagramId: String(businessId) } })

    if (!integration?.token) {
      throw new Error("no access token for business id")
    }

    // Decrypt the token before using it
    const accessToken = await decryptString(integration.token)
    await instagramService.sendCommentDM(accessToken, businessId, commentId, text);
  } catch (error) {
    console.error("[Activity] Failed to send DM:", error);
    throw error;
  }
}

export async function replyToInstagramComment(commentId: string, text: string, encryptedToken: string) {
  try {
    const accessToken = await decryptString(encryptedToken);
    await instagramService.replyToComment(accessToken, commentId, text);
  } catch (error) {
    console.error("[Activity] Failed to reply to comment:", error);
    throw error;
  }
}

