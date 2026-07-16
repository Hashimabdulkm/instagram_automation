"use server";

import { findUser } from "@/actions/user/queries";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { refreshToken } from "@/lib/fetch";
import { decryptString, encryptString } from "@/lib/crypto";
import { updateIntegration } from "../integrations/queries";
import { createUser } from "./queries";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type OnBoardUserResult =
    | {
        status: 200 | 201;
        data: {
            firstName?: string;
            lastName?: string;
            image?: string | null;
            email?: string | null;
            subscription?: unknown;
            automations?: unknown;
            integrations?: unknown;
            createdAt?: Date;
            updatedAt?: Date;
        };
    }
    | { status: 500 };

export const onCurrentUser = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return redirect("/login");
    }
    const user = session.user as {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    return user;
}

export const onBoardUser = async (): Promise<OnBoardUserResult> => {
    const user = await onCurrentUser();
    try {
        const found = await findUser(user.id);
        if (found) {
            if (found.integrations.length > 0) {
                const now = new Date();
                const expiresAtMs = found.integrations[0].expiresAt?.getTime() ?? 0;
                const msLeft = expiresAtMs - now.getTime();
                const days = Math.round(msLeft / (1000 * 3600 * 24));
                if (days < 5) {
                    const plaintext = await decryptString(found.integrations[0].token as unknown as string)
                    const refreshed = await refreshToken(plaintext)
                    const expireAt = new Date(now.getTime() + 60 * 24 * 3600 * 1000)

                    const update_token = await updateIntegration(
                        refreshed.access_token,
                        expireAt,
                        found.integrations[0].id
                    )
                }
            }
            return {
                status: 200,
                data: {
                    firstName: found.firstName,
                    lastName: found.lastName,
                    image: found.image,
                    email: found.email,
                    subscription: found.subscription,
                    automations: found.automations,
                    integrations: found.integrations,
                    createdAt: found.createdAt,
                    updatedAt: found.updatedAt,
                }
            }
        }
        const fullName = user.name ?? ""
        const [firstName, ...rest] = fullName.split(" ")
        const lastName = rest.join(" ") || ""

        const created = await createUser(
            user.id,
            user.email!,
            firstName,
            lastName,
            user.image ?? "",
        )
        return {
            status: 201,
            data: created,
        }

    } catch (error) {
        return {
            status: 500
        }
    }
}

export const onUserInfo = async () => {
    const user = await onCurrentUser();
    try {
        const profile = await findUser(user.id);
        if (profile) return { status: 200, data: profile };
        return { status: 404 };
    } catch (error) {
        return { status: 500 };
    }
}