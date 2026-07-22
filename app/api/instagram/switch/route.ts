import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "No user in session" }, { status: 401 });
  }

  const { integrationId } = await req.json();
  if (!integrationId) {
    return NextResponse.json({ error: "integrationId is required" }, { status: 400 });
  }

  // Verify the integration belongs to this user
  const integration = await client.integrations.findFirst({
    where: { id: integrationId, userId },
    select: { id: true, instagramId: true, username: true, accountName: true, profilePicture: true },
  });

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  await client.user.update({
    where: { id: userId },
    data: { activeIntegrationId: integrationId },
  });

  return NextResponse.json({ ok: true, activeIntegration: integration });
}
