import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: "Email, password, and first name are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await client.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    await client.user.create({
      data: {
        email,
        password: hash,
        firstName,
        lastName: lastName || "",
        image: "",
        subscription: { create: {} },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Register]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
