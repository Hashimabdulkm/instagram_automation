import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUserId = (session.user as any).id;

        const count = await client.leadNotifications.count({
            where: {
                userId: dbUserId,
                read: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("GET /api/notifications/count error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
