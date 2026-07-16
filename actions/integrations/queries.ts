"use server";

import { client } from "@/lib/prisma";
import { encryptString } from "@/lib/crypto";

export const updateIntegration = async (token: string, expire: Date, id: string) => {
    const encrypted = await encryptString(token)
    return await client.integrations.update({
        where: { id },
        data: {
            token: encrypted,
            expiresAt: expire,
        },
    })
}