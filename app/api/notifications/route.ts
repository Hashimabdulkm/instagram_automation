import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { getInstagramUserInfo } from "@/lib/instagram";
import { decryptString } from "@/lib/crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const dbUserId = (session.user as any).id;

    const notifications = await client.leadNotifications.findMany({
      where: {
        userId: dbUserId,
        ...(unreadOnly && { read: false })
      },
      include: {
        automation: {
          select: { name: true }
        }
      },
      orderBy: { triggeredAt: "desc" },
      take: limit,
    });

    // Try to update usernames for notifications that don't have them
    const notificationsWithUsernames = await Promise.all(
      notifications.map(async (notification: any) => {
        // If leadName is the same as leadId, try to fetch the username
        if (notification.leadName === notification.leadId) {
          try {
            // Get user's integration to fetch username
            const integration = await client.integrations.findFirst({
              where: { userId: dbUserId }
            });

            if (integration?.token) {
              const accessToken = await decryptString(integration.token);
              const userInfo = await getInstagramUserInfo(notification.leadId, accessToken);
              const username = userInfo.username || userInfo.name;

              if (username && username !== notification.leadId) {
                // Update the notification with the username
                await client.leadNotifications.update({
                  where: { id: notification.id },
                  data: { leadName: username }
                });

                return { ...notification, leadName: username };
              }
            }
          } catch (error) {
            console.error("Failed to fetch username for notification:");
          }
        }

        return notification;
      })
    );

    return NextResponse.json(notificationsWithUsernames);
  } catch (error) {
    console.error("GET /api/notifications error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, read } = body as { notificationIds: string[], read: boolean };

    if (!Array.isArray(notificationIds) || typeof read !== "boolean") {
      return NextResponse.json({ error: "notificationIds array and read boolean required" }, { status: 400 });
    }

    const dbUserId = (session.user as any).id;

    // Only update notifications that belong to the authenticated user
    const updated = await client.leadNotifications.updateMany({
      where: {
        id: { in: notificationIds },
        userId: dbUserId
      },
      data: { read },
    });

    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    console.error("PATCH /api/notifications error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
