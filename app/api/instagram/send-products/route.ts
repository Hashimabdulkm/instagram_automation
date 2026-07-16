import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { sendInstagramGenericTemplate } from "@/lib/instagram";
import { z } from "zod";

const sendProductsSchema = z.object({
  businessId: z.string(),
  toUserId: z.string(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = sendProductsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, toUserId, categoryId, subcategoryId } = parsed.data;

    // Get userId from the businessId (integration lookup)
    const integration = await client.integrations.findFirst({
      where: { instagramId: businessId }
    });

    if (!integration?.userId) {
      return NextResponse.json({ error: "No user found for this business ID" }, { status: 404 });
    }

    const userId = integration.userId;

    // Build where clause for products
    const where: any = {
      userId,
      active: true,
    };

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get products
    const products = await client.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        buttons: true,
      }
    });

    if (products.length === 0) {
      const { sendInstagramButtonTemplate } = await import("@/lib/instagram");
      await sendInstagramButtonTemplate({
        businessId,
        toUserId,
        text: "No products found.",
        buttons: [{
          type: "postback",
          title: "Back to Categories",
          payload: JSON.stringify({ action: "show_categories", userId })
        }]
      });
    } else {
      // Send products as generic template (max 10 elements)
      const elements = products.slice(0, 10).map((product: any) => ({
        title: product.title,
        image_url: product.imageUrl || "https://via.placeholder.com/300x200",
        subtitle: product.description || "",
        default_action: {
          type: "web_url" as const,
          url: (product.buttons as any)?.[0]?.url || "#"
        },
        buttons: [
          ...(product.buttons as any || []).map((btn: any) => ({
            type: "web_url" as const,
            title: btn.label,
            url: btn.url
          })),
          {
            type: "postback" as const,
            title: "Back to Categories",
            payload: JSON.stringify({ action: "show_categories", userId })
          }
        ]
      }));

      await sendInstagramGenericTemplate({
        businessId,
        toUserId,
        elements
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/instagram/send-products error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
