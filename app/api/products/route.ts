import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const productSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string().url(),
    buttons: z.array(z.object({ label: z.string().min(1), url: z.string().url() })),
    categoryId: z.string().uuid(),
    subcategoryId: z.string().uuid(),
    active: z.boolean()
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionAny = (await getServerSession(authOptions as any)) as any;
        const userId = sessionAny?.user?.id as string | undefined;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const categoryId = searchParams.get("categoryId") || undefined;
        const subcategoryId = searchParams.get("subcategoryId") || undefined;

        const products = await client.product.findMany({
            where: {
                userId,
                categoryId: categoryId ?? undefined,
                subcategoryId: subcategoryId ?? undefined,
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                buttons: true,
                categoryId: true,
                subcategoryId: true,
                createdAt: true,
                updatedAt: true,
                active: true,
            }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("GET /api/products error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const sessionAny = (await getServerSession(authOptions as any)) as any;
        const userId = sessionAny?.user?.id as string | undefined;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const json = await request.json();
        const parsed = productSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const data = parsed.data as any;
        const created = await client.product.create({
            data: {
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                buttons: data.buttons as any,
                userId,
                categoryId: data.categoryId,
                subcategoryId: data.subcategoryId,
                active: data.active,
            }
        });
        const response = {
            id: created.id,
            title: created.title,
            description: created.description,
            imageUrl: created.imageUrl,
            buttons: created.buttons as any,
            categoryId: created.categoryId,
            subcategoryId: created.subcategoryId,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            active: created.active,
        };
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("POST /api/products error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

