"use server";

import { client } from "@/lib/prisma";

export const findUser = async (id: string) => {
    return await client.user.findUnique({
        where: {
            id,
        },
        include: {
            subscription: true,
            automations: true,
            integrations: {
                select: {
                    id: true,
                    token: true,
                    expiresAt: true,
                    name: true,
                    instagramId: true,
                    accountName: true,
                    username: true,
                    profilePicture: true,
                },
            },
        },
    });
}

export const createUser = async (
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    image: string
) => {
    return await client.user.create({
        data: {
            id,
            email,
            firstName,
            lastName,
            image,
            subscription: {
                create: {},
            },
        },
        select: {
            firstName: true,
            lastName: true,
        },
    })
}