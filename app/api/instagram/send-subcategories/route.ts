import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { sendInstagramButtonTemplate } from "@/lib/instagram";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const sendSubcategoriesSchema = z.object({
  businessId: z.string(),
  toUserId: z.string(),
  categoryId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = sendSubcategoriesSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, toUserId, categoryId, parentId } = parsed.data;

    // Get userId from the businessId (integration lookup)
    const integration = await client.integrations.findFirst({
      where: { instagramId: businessId }
    });

    if (!integration?.userId) {
      return NextResponse.json({ error: "No user found for this business ID" }, { status: 404 });
    }

    const userId = integration.userId;

    // Get subcategories for the category and parent
    const where: any = {
      userId,
      categoryId
    };

    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null; // Top-level subcategories
    }

    const subcategories = await client.subcategory.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    });

    if (subcategories.length === 0) {
      // No subcategories, check if there are products directly in the category
      const products = await client.product.findMany({
        where: {
          userId,
          categoryId,
          subcategoryId: null,
          active: true,
        },
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
        await sendInstagramButtonTemplate({
          businessId,
          toUserId,
          text: "No subcategories or products found in this category.",
          buttons: [{
            type: "postback",
            title: "Back to Categories",
            payload: JSON.stringify({ action: "show_categories", userId })
          }]
        });
      } else {
        // Send products as generic template
        const elements = products.slice(0, 10).map(product => ({
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

        const { sendInstagramGenericTemplate } = await import("@/lib/instagram");
        await sendInstagramGenericTemplate({
          businessId,
          toUserId,
          elements
        });
      }
    } else {
      // Create buttons for subcategories (max 3 buttons per template)
      const buttons = subcategories.slice(0, 3).map(subcategory => ({
        type: "postback" as const,
        title: subcategory.name,
        payload: JSON.stringify({
          action: "select_subcategory",
          id: subcategory.id,
          userId
        })
      }));

      // Add back button
      buttons.push({
        type: "postback" as const,
        title: "Back to Categories",
        payload: JSON.stringify({ action: "show_categories", userId })
      });

      await sendInstagramButtonTemplate({
        businessId,
        toUserId,
        text: "Please select a subcategory:",
        buttons
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/instagram/send-subcategories error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
