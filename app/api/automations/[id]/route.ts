import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Handle simple active status toggle
    if (body.active !== undefined && Object.keys(body).length === 1) {
      const { active } = body as { active: boolean };

      if (typeof active !== "boolean") {
        return NextResponse.json({ error: "active field is required and must be boolean" }, { status: 400 });
      }

      const updated = await client.automations.update({
        where: { id: params.id },
        data: { active },
      });

      return NextResponse.json({
        id: updated.id,
        active: updated.active,
        status: updated.active ? "active" : "draft"
      });
    }

    // Handle full campaign update
    const {
      name,
      status,
      triggerType,
      triggerKeywords,
      responseType,
      predefinedMessage,
      aiModel,
      aiPrompt,
      optionalPostText,
      commentReplyText,
      postSelectionMode,
      selectedPostIds,
    } = body as {
      name: string
      status: "draft" | "active"
      triggerType: "comment" | "dm"
      triggerKeywords: string[]
      responseType: "predefined" | "ai"
      predefinedMessage?: string
      aiModel?: string
      aiPrompt?: string
      optionalPostText?: string
      commentReplyText?: string
      postSelectionMode?: "all" | "specific" | "next"
      selectedPostIds?: string[]
    };

    if (!name || !triggerType || !responseType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the automation with all related data
    const updated = await client.automations.update({
      where: { id: params.id },
      data: {
        name,
        active: status === "active",
        // Update trigger
        trigger: {
          deleteMany: {},
          create: [{ type: triggerType }],
        },
        // Update listener
        listener: {
          deleteMany: {},
          create: [{
            type: responseType,
            listener: responseType === "predefined" ? "MESSAGE" : "SMARTAI",
            prompt: responseType === "ai" ? (aiPrompt || "") : "",
            commendReply: responseType === "predefined" ? (predefinedMessage || "") : null,
            commentReply: triggerType === "comment" ? (commentReplyText || "") : null,
          }],
        },
        // Update keywords
        keywords: {
          deleteMany: {},
          create: triggerKeywords?.length ? triggerKeywords.map((word: string) => ({ word })) : [],
        },
        // Update postIds
        postIds: postSelectionMode === "specific" && selectedPostIds?.length
          ? selectedPostIds
          : [],
      },
      include: {
        trigger: true,
        listener: true,
        keywords: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      active: updated.active,
      status: updated.active ? "active" : "draft"
    });
  } catch (error) {
    console.error("PATCH /api/automations/[id] error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const automation = await client.automations.findUnique({
      where: { id: params.id },
      include: { keywords: true, listener: true, trigger: true },
    });

    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: automation.id,
      name: automation.name,
      active: automation.active,
      status: automation.active ? "active" : "draft",
      keywords: automation.keywords,
      listener: automation.listener,
      trigger: automation.trigger,
      postIds: automation.postIds,
    });
  } catch (error) {
    console.error("GET /api/automations/[id] error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await client.automations.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/automations/[id] error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
