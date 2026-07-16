import { NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const categorySchema = z.object({ name: z.string().min(1) });

export async function GET(request: Request) {
    try {
        const sessionAny = (await getServerSession(authOptions as any)) as any;
        const userId = sessionAny?.user?.id as string | undefined;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const cats = await client.category.findMany({
            where: { userId },
            orderBy: { name: "asc" },
            select: { id: true, name: true, createdAt: true, updatedAt: true }
        });
        return NextResponse.json(cats);
    } catch (error) {
        console.error("GET /api/products/categories error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const sessionAny = (await getServerSession(authOptions as any)) as any;
        const userId = sessionAny?.user?.id as string | undefined;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const json = await request.json();
        const parsed = categorySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const created = await client.category.create({ data: { name: parsed.data.name, userId } });
        const response = { id: created.id, name: created.name, createdAt: created.createdAt, updatedAt: created.updatedAt };
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("POST /api/products/categories error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

