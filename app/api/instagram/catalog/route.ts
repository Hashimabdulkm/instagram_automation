import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { sendInstagramButtonTemplate, sendInstagramGenericTemplate } from "@/lib/instagram";
import { z } from "zod";

const postbackSchema = z.object({
  businessId: z.string(),
  toUserId: z.string(),
  payload: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = postbackSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { businessId, toUserId, payload } = parsed.data;

    // Get userId from the businessId (integration lookup)
    const integration = await client.integrations.findFirst({
      where: { instagramId: businessId }
    });

    if (!integration?.userId) {
      return NextResponse.json({ error: "No user found for this business ID" }, { status: 404 });
    }

    const userId = integration.userId;

    // Parse the payload to determine the action
    const payloadData = JSON.parse(payload);
    const { action, id } = payloadData;

    if (action === "select_category") {
      // Show subcategories for the selected category
      const subcategories = await client.subcategory.findMany({
        where: {
          userId,
          categoryId: id,
          parentId: null, // Only top-level subcategories
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      });

      if (subcategories.length === 0) {
        // No subcategories, show products directly
        const products = await client.product.findMany({
          where: {
            userId,
            categoryId: id,
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
            text: "No products found in this category.",
            buttons: [{
              type: "postback",
              title: "Back to Categories",
              payload: JSON.stringify({ action: "show_categories", userId })
            }]
          });
        } else {
          // Send products as generic template
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
      } else {
        // Show subcategories as buttons
        const buttons = subcategories.slice(0, 3).map(sub => ({
          type: "postback" as const,
          title: sub.name,
          payload: JSON.stringify({ action: "select_subcategory", id: sub.id, userId })
        }));

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
    } else if (action === "select_subcategory") {
      // Show sub-subcategories or products for the selected subcategory
      const subcategories = await client.subcategory.findMany({
        where: {
          userId,
          parentId: id,
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      });

      if (subcategories.length === 0) {
        // No sub-subcategories, show products
        const products = await client.product.findMany({
          where: {
            userId,
            subcategoryId: id,
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
            text: "No products found in this subcategory.",
            buttons: [{
              type: "postback",
              title: "Back to Categories",
              payload: JSON.stringify({ action: "show_categories", userId })
            }]
          });
        } else {
          // Send products as generic template
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
      } else {
        // Show sub-subcategories as buttons
        const buttons = subcategories.slice(0, 3).map(sub => ({
          type: "postback" as const,
          title: sub.name,
          payload: JSON.stringify({ action: "select_subcategory", id: sub.id, userId })
        }));

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
    } else if (action === "show_categories") {
      // Show all categories
      const categories = await client.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      });

      if (categories.length === 0) {
        await sendInstagramButtonTemplate({
          businessId,
          toUserId,
          text: "No categories available.",
          buttons: []
        });
      } else {
        const buttons = categories.slice(0, 3).map(cat => ({
          type: "postback" as const,
          title: cat.name,
          payload: JSON.stringify({ action: "select_category", id: cat.id, userId })
        }));

        await sendInstagramButtonTemplate({
          businessId,
          toUserId,
          text: "Please select a category:",
          buttons
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/instagram/catalog error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
