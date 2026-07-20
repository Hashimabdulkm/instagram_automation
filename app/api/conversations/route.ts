import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { getInstagramConversations } from "@/lib/instagram";
import { decryptString } from "@/lib/crypto";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId === "undefined") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: { userId },
    });

    if (!integration?.token || !integration?.instagramId) {
      return NextResponse.json({ error: "No Instagram integration found" }, { status: 404 });
    }

    // Decrypt the token before using it
    const accessToken = await decryptString(integration.token);

    // Fetch conversations from Instagram
    const conversations = await getInstagramConversations(
      integration.instagramId,
      accessToken
    );

    return NextResponse.json({
      ...conversations,
      businessAccountId: integration.instagramId
    });
  } catch (error) {
    console.error("GET /api/conversations error", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
