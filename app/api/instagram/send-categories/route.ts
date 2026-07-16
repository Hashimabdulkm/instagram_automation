import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { sendInstagramButtonTemplate } from "@/lib/instagram";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const sendCategoriesSchema = z.object({
  businessId: z.string(),
  toUserId: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = sendCategoriesSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, toUserId } = parsed.data;

    // Get userId from the businessId (integration lookup)
    const integration = await client.integrations.findFirst({
      where: { instagramId: businessId }
    });

    if (!integration?.userId) {
      return NextResponse.json({ error: "No user found for this business ID" }, { status: 404 });
    }

    const userId = integration.userId;

    console.log("[Send Categories] Getting categories for userId:", userId);

    // Get all categories for the user
    const categories = await client.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    });

    console.log("[Send Categories] Found categories:", categories);

    if (categories.length === 0) {
      console.log("[Send Categories] No categories found, sending empty message");
      await sendInstagramButtonTemplate({
        businessId,
        toUserId,
        text: "No categories available at the moment.",
        buttons: []
      });
    } else {
      // Create buttons for categories (max 3 buttons per template)
      const buttons = categories.slice(0, 3).map((category: any) => ({
        type: "postback" as const,
        title: category.name,
        payload: JSON.stringify({
          action: "select_category",
          id: category.id,
          userId
        })
      }));

      console.log("[Send Categories] Sending buttons:", buttons);

      await sendInstagramButtonTemplate({
        businessId,
        toUserId,
        text: "Please select a category to browse our products:",
        buttons
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/instagram/send-categories error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
