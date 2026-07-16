"use server";

import { getServerSession } from "next-auth";
import { client } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getContactInfo() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return null;
    }

    const user = session.user as {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    const dbUser = await client.user.findUnique({
      where: { id: user.id },
      select: {
        additionalEmail: true,
        phone: true,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error getting contact info:", error);
    return null;
  }
}
