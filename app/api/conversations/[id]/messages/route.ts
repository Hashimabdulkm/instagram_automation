import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { getConversationMessages } from "@/lib/instagram";
import { decryptString } from "@/lib/crypto";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: { userId },
    });

    if (!integration?.token) {
      return NextResponse.json({ error: "No Instagram integration found" }, { status: 404 });
    }

    // Decrypt the token before using it
    const accessToken = await decryptString(integration.token);

    // Fetch messages for the conversation
    const messages = await getConversationMessages(
      params.id,
      accessToken
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/conversations/[id]/messages error", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
