"use server";

import { getServerSession } from "next-auth";
import { client } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateContactInfo(data: {
  additionalEmail?: string;
  phone?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const user = session.user as {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    // Update user contact information in database
    const updatedUser = await client.user.update({
      where: { id: user.id },
      data: {
        additionalEmail: data.additionalEmail || null,
        phone: data.phone || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        additionalEmail: true,
        phone: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: {
        additionalEmail: updatedUser.additionalEmail,
        phone: updatedUser.phone,
        updatedAt: updatedUser.updatedAt,
      }
    };
  } catch (error) {
    console.error("Error updating contact info:", error);
    return { success: false, error: "Failed to update contact information" };
  }
}
