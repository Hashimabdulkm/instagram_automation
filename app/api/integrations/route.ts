import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "No user in session" }, { status: 401 });
  }

  const [integrations, user] = await Promise.all([
    client.integrations.findMany({
      where: { userId },
      select: {
        id: true,
        instagramId: true,
        accountName: true,
        username: true,
        profilePicture: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    client.user.findUnique({
      where: { id: userId },
      select: { activeIntegrationId: true },
    }),
  ]);

  return NextResponse.json({
    integrations,
    activeIntegrationId: user?.activeIntegrationId ?? null,
  });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "No user in session" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const integrationId = searchParams.get("id");
  if (!integrationId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Confirm ownership
  const integration = await client.integrations.findFirst({
    where: { id: integrationId, userId },
  });
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  await client.integrations.delete({ where: { id: integrationId } });

  // If this was the active account, clear or switch to another
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { activeIntegrationId: true },
  });
  if (user?.activeIntegrationId === integrationId) {
    const next = await client.integrations.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    await client.user.update({
      where: { id: userId },
      data: { activeIntegrationId: next?.id ?? null },
    });
  }

  return NextResponse.json({ ok: true });
}
