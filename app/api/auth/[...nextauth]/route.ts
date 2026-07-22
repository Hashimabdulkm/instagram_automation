import NextAuth, { type AuthOptions } from "next-auth";
import type { NextRequest } from "next/server";
import Instagram from "next-auth/providers/instagram";
import CredentialsProvider from "next-auth/providers/credentials";
import { client } from "@/lib/prisma";
import { encryptString } from "@/lib/crypto";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { User, Account, Profile } from "next-auth";
import { getInstagramMe, exchangeToLongLivedInstagramToken } from "@/lib/instagram";
import { InstagramService, InstagramWebhookField } from "@/lib/services/instagram-service";
import bcrypt from "bcryptjs";

async function subscribeToInstagramWebhooks(instagramId: string, accessToken: string) {
  try {
    const svc = new InstagramService();
    const fields: InstagramWebhookField[] = [
      "comments", "live_comments", "messages",
      "message_reactions", "messaging_postbacks", "messaging_seen",
    ];
    const result = await svc.subscribeToWebhook(instagramId, accessToken, fields);
    if (result.ok) {
      console.log(`[Webhook] ✅ Subscribed: ${fields.join(", ")}`);
    } else {
      console.warn(`[Webhook] ⚠️ Failed: ${result.error}`);
    }
  } catch (err) {
    console.error("[Webhook] ❌ Exception:", err);
  }
}

// ---------------------------------------------------------------------------
// buildAuthOptions – called once per request so connectUserId is in the closure
// connectUserId comes from req.cookies.get("ig_connect_uid") in the route handler
// ---------------------------------------------------------------------------
function buildAuthOptions(connectUserId: string | null): AuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          try {
            const user = await client.user.findUnique({
              where: { email: credentials.email },
              select: { id: true, email: true, firstName: true, lastName: true, image: true, password: true },
            });
            if (!user?.password) return null;
            const valid = await bcrypt.compare(credentials.password, user.password);
            if (!valid) return null;
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`.trim(),
              image: user.image,
            };
          } catch {
            return null;
          }
        },
      }),
      Instagram({
        clientId: process.env.INSTAGRAM_CLIENT_ID as string,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
        authorization: {
          params: {
            scope:
              "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_manage_insights",
          },
        },
      }),
    ],

    pages: { signIn: "/login" },

    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
    },

    callbacks: {
      async redirect({ url, baseUrl }) {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (new URL(url).origin === baseUrl) return url;
        return `${baseUrl}/dashboard`;
      },

      async jwt({ token, account, user }: { token: JWT; account: Account | null; user?: User }) {
        if (account?.provider === "credentials" && user) {
          (token as any).userId = user.id;
          (token as any).sub = user.id;
          return token;
        }

        if (account) {
          (token as any).accessToken = (account as any).access_token;
          (token as any).accessTokenExpires = (account as any).expires_at
            ? ((account as any).expires_at as number) * 1000
            : undefined;

          try {
            const providerAccountId = String(account.providerAccountId);
            const accessToken = (account as any).access_token as string | undefined;

            // Always set a baseline instagramId so the recovery path can work
            (token as any).instagramId = providerAccountId;

            // 1. Try by credentialID (Instagram-login users store providerAccountId here)
            let dbUser = await client.user.findFirst({ where: { credentialID: providerAccountId } });

            if (!dbUser) {
              // 2. Direct integration lookup by providerAccountId (may already match instagramId)
              let integration = await client.integrations.findFirst({
                where: { instagramId: providerAccountId },
              });

              // 3. Fallback: getInstagramMe to resolve the real business account ID
              //    (providerAccountId is the app-scoped ID; instagramId stored is user_id)
              if (!integration && accessToken) {
                try {
                  const me = await getInstagramMe(accessToken);
                  const realInstagramId = me?.user_id;
                  if (realInstagramId) {
                    (token as any).instagramId = realInstagramId;
                    if (realInstagramId !== providerAccountId) {
                      integration = await client.integrations.findFirst({
                        where: { instagramId: realInstagramId },
                      });
                    }
                  }
                } catch {
                  // Short-lived token may be expired; recovery path will retry via instagramId
                }
              }

              if (integration?.userId) {
                dbUser = await client.user.findUnique({ where: { id: integration.userId } });
              }
            }

            if (dbUser) {
              (token as any).userId = dbUser.id;
              (token as any).sub = dbUser.id;
            }
          } catch (e) {
            console.error("[JWT] lookup error:", e);
          }
        }

        if (!(token as any).userId && (token as any).instagramId) {
          try {
            const integration = await client.integrations.findFirst({
              where: { instagramId: (token as any).instagramId },
            });
            if (integration?.userId) (token as any).userId = integration.userId;
          } catch (e) {
            console.error("[JWT] recovery error:", e);
          }
        }

        return token;
      },

      async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
        if (account?.provider === "credentials") return true;

        try {
          if (account?.provider === "instagram") {
            const instagramId = String(account.providerAccountId);
            const accessToken = (account as any).access_token as string | undefined;

            if (!accessToken) throw new Error("Missing access token from Instagram");

            // Exchange short-lived → long-lived token (60 days)
            const longLived = await exchangeToLongLivedInstagramToken(
              accessToken,
              process.env.INSTAGRAM_CLIENT_SECRET as string
            );
            if (!longLived?.access_token) throw new Error("Failed to exchange long-lived token");

            const finalToken = longLived.access_token;
            const expiresAt = new Date(Date.now() + Number(longLived.expires_in) * 1000);

            const me = await getInstagramMe(finalToken);
            const realInstagramId = me?.user_id;
            const profilePictureUrl = me?.profile_picture_url ?? null;
            const igUsername = me?.username ?? null;

            console.log(`[SignIn] Instagram id=${realInstagramId} connectUserId=${connectUserId}`);

            if (!realInstagramId) {
              console.error("[SignIn] Instagram API did not return user_id");
              return `${process.env.NEXTAUTH_URL}/dashboard/settings?connect=error&reason=api-error`;
            }

            // ── 1. Integration already exists → refresh token ─────────────────
            const existing = await client.integrations.findFirst({
              where: { instagramId: realInstagramId },
            });

            if (existing) {
              if (connectUserId && existing.userId !== connectUserId) {
                // Check whether the current owner is an Instagram-only user (no password).
                // If so, this account was created by a previous OAuth-only sign-in and can
                // be transferred to the credentials user who is explicitly claiming it.
                const existingOwner = existing.userId
                  ? await client.user.findUnique({
                      where: { id: existing.userId },
                      select: { password: true },
                    })
                  : null;

                if (existingOwner?.password) {
                  // Belongs to another full credentials user → block
                  console.warn("[SignIn] Instagram account belongs to another credentials user");
                  return `${process.env.NEXTAUTH_URL}/dashboard/settings?connect=error&reason=already-linked`;
                }

                // Transfer from Instagram-only user to this credentials user
                console.log(`[SignIn] Transferring integration ${existing.id} → user ${connectUserId}`);
                await client.integrations.update({
                  where: { id: existing.id },
                  data: {
                    userId: connectUserId,
                    token: await encryptString(finalToken),
                    expiresAt,
                    username: igUsername,
                    profilePicture: profilePictureUrl,
                    accountName: user?.name || igUsername || null,
                  },
                });

                const dbUser = await client.user.findUnique({
                  where: { id: connectUserId },
                  select: { activeIntegrationId: true },
                });
                if (!dbUser?.activeIntegrationId) {
                  await client.user.update({
                    where: { id: connectUserId },
                    data: { activeIntegrationId: existing.id },
                  });
                }

                if (profilePictureUrl) {
                  await client.user.update({
                    where: { id: connectUserId },
                    data: { image: profilePictureUrl },
                  });
                }

                subscribeToInstagramWebhooks(realInstagramId, finalToken).catch(() => {});
                return `${process.env.NEXTAUTH_URL}/dashboard/settings?connect=success`;
              }

              // Same user — just refresh the token
              await client.integrations.update({
                where: { id: existing.id },
                data: {
                  token: await encryptString(finalToken),
                  expiresAt,
                  username: igUsername,
                  profilePicture: profilePictureUrl,
                  accountName: user?.name || igUsername || null,
                },
              });

              if (profilePictureUrl && existing.userId) {
                await client.user.update({
                  where: { id: existing.userId },
                  data: { image: profilePictureUrl },
                });
              }

              subscribeToInstagramWebhooks(realInstagramId, finalToken).catch(() => {});
              // In add-account mode: redirect to preserve the credentials session
              if (connectUserId) {
                return `${process.env.NEXTAUTH_URL}/dashboard/settings?connect=success`;
              }
              return true;
            }

            // ── 2. Add-account mode: attach new Instagram to the existing user ─
            if (connectUserId) {
              console.log(`[SignIn] Add-account mode → linking to user ${connectUserId}`);
              const newIntegration = await client.integrations.create({
                data: {
                  userId: connectUserId,
                  token: await encryptString(finalToken),
                  expiresAt,
                  instagramId: realInstagramId || "",
                  username: igUsername,
                  profilePicture: profilePictureUrl,
                  accountName: user?.name || igUsername || null,
                },
              });

              const dbUser = await client.user.findUnique({
                where: { id: connectUserId },
                select: { activeIntegrationId: true },
              });
              if (!dbUser?.activeIntegrationId) {
                await client.user.update({
                  where: { id: connectUserId },
                  data: { activeIntegrationId: newIntegration.id },
                });
              }

              if (realInstagramId) {
                subscribeToInstagramWebhooks(realInstagramId, finalToken).catch(() => {});
              }
              // Return redirect to preserve existing session (same reasoning as above)
              return `${process.env.NEXTAUTH_URL}/dashboard/settings?connect=success`;
            }

            // ── 3. Normal login: find or create user ──────────────────────────
            const igEmail = user?.email ?? null;
            const existingUser =
              (await client.user.findFirst({ where: { credentialID: instagramId } })) ||
              (igEmail ? await client.user.findUnique({ where: { email: igEmail } }) : null);

            let dbUserId: string;
            if (existingUser) {
              dbUserId = existingUser.id;
              if (!existingUser.credentialID) {
                await client.user.update({
                  where: { id: dbUserId },
                  data: { credentialID: instagramId },
                });
              }
            } else {
              const fullName = user?.name ?? "";
              const [firstName, ...rest] = fullName.split(" ");
              const created = await client.user.create({
                data: {
                  credentialID: instagramId,
                  email: igEmail ?? `${instagramId}@instagram.local`,
                  firstName: firstName || "Instagram",
                  lastName: rest.join(" ") || "User",
                  image: profilePictureUrl || user?.image || "",
                  subscription: { create: {} },
                },
              });
              dbUserId = created.id;
            }

            const newIntegration = await client.integrations.create({
              data: {
                userId: dbUserId,
                token: await encryptString(finalToken),
                expiresAt,
                instagramId: realInstagramId || "",
                username: igUsername,
                profilePicture: profilePictureUrl,
                accountName: user?.name || igUsername || null,
              },
            });

            const dbUser = await client.user.findUnique({
              where: { id: dbUserId },
              select: { activeIntegrationId: true },
            });
            if (!dbUser?.activeIntegrationId) {
              await client.user.update({
                where: { id: dbUserId },
                data: { activeIntegrationId: newIntegration.id },
              });
            }

            if (realInstagramId) {
              subscribeToInstagramWebhooks(realInstagramId, finalToken).catch(() => {});
            }
          }
          return true;
        } catch (error) {
          console.error("[SignIn] error:", error);
          return false;
        }
      },

      async session({ session, token }: { session: Session; token: JWT }) {
        if (session.user) {
          try {
            let userId = (token as any).userId as string | undefined;
            console.log("[Session] token.userId:", userId, "token.sub:", token.sub);

            if (!userId && token.sub) {
              const found = await client.user.findFirst({ where: { credentialID: token.sub } });
              if (found) userId = found.id;
            }

            if (!userId && (token as any).instagramId) {
              const integration = await client.integrations.findFirst({
                where: { instagramId: (token as any).instagramId },
              });
              if (integration?.userId) userId = integration.userId;
            }

            if (userId) {
              (session.user as any).id = userId;
              const dbUser = await client.user.findUnique({
                where: { id: userId },
                select: { additionalEmail: true, image: true, activeIntegrationId: true },
              });
              if (dbUser) {
                (session.user as any).additionalEmail = dbUser.additionalEmail;
                (session.user as any).activeIntegrationId = dbUser.activeIntegrationId;
                if (dbUser.image) session.user.image = dbUser.image;
              }
            }
          } catch (err) {
            console.error("[Session] error:", err);
          }
        }
        return session;
      },
    },
  };
}

// ---------------------------------------------------------------------------
// authOptions – used by getServerSession() in server actions / API routes.
// connectUserId is null here because there is no request context.
// ---------------------------------------------------------------------------
export const authOptions = buildAuthOptions(null);

// ---------------------------------------------------------------------------
// Route handlers – reads the ig_connect_uid cookie from the real request
// and passes it into the auth options closure before NextAuth runs.
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest, ctx: any) {
  let connectUserId = req.cookies.get("ig_connect_uid")?.value ?? null;

  // Fallback: cookie can be lost through the OAuth redirect chain.
  // If this is the Instagram callback and the cookie is missing, use the
  // existing credentials session as the connect target.
  if (!connectUserId) {
    try {
      const { pathname } = new URL(req.url);
      if (pathname === "/api/auth/callback/instagram") {
        const existing = await getServerSession(buildAuthOptions(null));
        const uid = (existing?.user as any)?.id as string | undefined;
        if (uid) {
          connectUserId = uid;
          console.log("[NextAuth GET] Fallback connectUserId from session:", uid);
        }
      }
    } catch {}
  }

  if (connectUserId) console.log("[NextAuth GET] connect mode, userId:", connectUserId);
  return NextAuth(buildAuthOptions(connectUserId))(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  const connectUserId = req.cookies.get("ig_connect_uid")?.value ?? null;
  if (connectUserId) console.log("[NextAuth POST] connect mode, userId:", connectUserId);
  return NextAuth(buildAuthOptions(connectUserId))(req, ctx);
}
