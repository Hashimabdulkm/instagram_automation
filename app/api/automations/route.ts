import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
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
      userId: string
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

    if (!userId || !name || !triggerType || !responseType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map non-UUID userId (e.g., Instagram credential) to real DB UUID
    let dbUserId = userId as string
    if (dbUserId.length < 32) {
      const maybe = await client.user.findFirst({ where: { credentialID: dbUserId } })
      if (!maybe?.id) {
        return NextResponse.json({ error: "Unknown user" }, { status: 400 })
      }
      dbUserId = maybe.id
    }

    const created = await client.automations.create({
      data: {
        userId: dbUserId,
        name,
        active: status === "active",
        trigger: {
          create: [{ type: triggerType }],
        },
        listener: {
          create: [
            {
              type: responseType,
              listener: responseType === "predefined" ? "MESSAGE" : "SMARTAI",
              prompt: responseType === "ai" ? (aiPrompt || "") : "",
              commendReply: responseType === "predefined" ? (predefinedMessage || "") : null,
              commentReply: triggerType === "comment" ? (commentReplyText || "") : null,
            },
          ],
        },
        keywords: triggerKeywords?.length
          ? {
            create: triggerKeywords.map((word: string) => ({ word })),
          }
          : undefined,
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

    return NextResponse.json({ id: created.id });
  } catch (error) {
    console.error("POST /api/automations error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // If userId is not a UUID, try mapping from credentialID (instagram id)
    if (userId && userId.length < 32) {
      const maybe = await client.user.findFirst({ where: { credentialID: userId } });
      if (maybe?.id) userId = maybe.id;
    }

    const autos = await client.automations.findMany({
      where: { userId },
      include: { keywords: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      autos.map((a) => ({ id: a.id, name: a.name, status: a.active ? "active" : "draft" }))
    );
  } catch (error) {
    console.error("GET /api/automations error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


