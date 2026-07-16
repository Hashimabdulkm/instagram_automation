import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    // Get userId from the businessId (integration lookup)
    const integration = await client.integrations.findFirst({
      where: { instagramId: businessId }
    });

    if (!integration?.userId) {
      return NextResponse.json({ error: "No user found for this business ID" }, { status: 404 });
    }

    const userId = integration.userId;

    // Get all categories for the user
    const categories = await client.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    });

    return NextResponse.json({
      businessId,
      userId,
      categories,
      integration: {
        id: integration.id,
        instagramId: integration.instagramId,
        userId: integration.userId
      }
    });
  } catch (error) {
    console.error("GET /api/test-catalog error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
