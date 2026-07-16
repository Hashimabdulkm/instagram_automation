import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const subcategorySchema = z.object({
    name: z.string().min(1),
    categoryId: z.string().uuid(),
    parentId: z.string().uuid().nullable().optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionAny = (await getServerSession(authOptions as any)) as any;
        const userId = sessionAny?.user?.id as string | undefined;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const categoryId = searchParams.get("categoryId");
        const parentId = searchParams.get("parentId");
        const where: any = { userId };
        if (categoryId) where.categoryId = categoryId;
        if (parentId === "ROOT") where.parentId = null;
        else if (parentId) where.parentId = parentId;
        const subs = await client.subcategory.findMany({
            where,
            orderBy: { name: "asc" },
            select: { id: true, name: true, categoryId: true, parentId: true, createdAt: true, updatedAt: true }
        });
        return NextResponse.json(subs);
    } catch (error) {
        console.error("GET /api/products/subcategories error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const sessionAny = (await getServerSession(authOptions as any)) as any;
        const userId = sessionAny?.user?.id as string | undefined;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const json = await request.json();
        const parsed = subcategorySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const created = await client.subcategory.create({
            data: { name: parsed.data.name, categoryId: parsed.data.categoryId, userId, parentId: parsed.data.parentId } as any
        });
        const response = { id: created.id, name: created.name, categoryId: created.categoryId, parentId: created.parentId, createdAt: created.createdAt, updatedAt: created.updatedAt };
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("POST /api/products/subcategories error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

