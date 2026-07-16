"use server"

import { client } from '@/lib/prisma'

export const createAutomation = async (userId: string) => {
    return await client.user.update({
        where: {
            id: userId,
        },
        data: {
            automations: {
                create: {},
            },
        },
    })
}