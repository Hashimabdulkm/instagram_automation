import NextAuth, { type AuthOptions } from "next-auth";
import Instagram from "next-auth/providers/instagram";
import { client } from "@/lib/prisma";
import { encryptString } from "@/lib/crypto";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { User, Account, Profile } from "next-auth";
import { getInstagramMe, exchangeToLongLivedInstagramToken } from "@/lib/instagram";
import { InstagramService, InstagramWebhookField } from "@/lib/services/instagram-service";

/**
 * Subscribe to Instagram webhooks for comments and messages
 * Called during sign-in to enable real-time notifications
 */
async function subscribeToInstagramWebhooks(instagramId: string, accessToken: string) {
  try {
    const instagramService = new InstagramService();

    // Subscribe to comment and messaging webhooks
    const webhookFields: InstagramWebhookField[] = [
      "comments",        // Comments on media
      "live_comments",   // Comments during live videos
      "messages",        // Incoming messages
      "message_reactions", // Message reactions
      "messaging_postbacks", // Button postback events
      "messaging_seen",  // Message read receipts
    ];

    const result = await instagramService.subscribeToWebhook(
      instagramId,
      accessToken,
      webhookFields
    );

    if (result.ok) {
      console.log(`[Webhook Subscription] ✅ Successfully subscribed to: ${webhookFields.join(", ")}`);
      return true;
    } else {
      console.warn(`[Webhook Subscription] ⚠️  Failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error("[Webhook Subscription] ❌ Exception:", error);
    return false;
  }
}

export const authOptions: AuthOptions = {
  providers: [
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
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always redirect to dashboard after successful auth
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        (token as any).accessToken = (account as any).access_token;
        (token as any).accessTokenExpires = (account as any).expires_at
          ? ((account as any).expires_at as number) * 1000
          : undefined;
        (token as any).refreshToken = (account as any).refresh_token;

        try {
          const instagramId = String(account.providerAccountId);
          const dbUser = await client.user.findFirst({ where: { credentialID: instagramId } });
          if (dbUser) {
            (token as any).userId = dbUser.id;
            (token as any).sub = dbUser.id;
          }
        } catch (e) {
          console.error("Error looking up user in jwt callback:", e);
        }
      }

      // Recovery: if userId is missing on subsequent requests, try to recover from sub
      if (!(token as any).userId && token.sub) {
        try {
          const dbUser = await client.user.findFirst({ where: { credentialID: token.sub } });
          if (dbUser) {
            (token as any).userId = dbUser.id;
            (token as any).sub = dbUser.id;
          }
        } catch (e) {
          console.error("Error recovering userId in jwt callback:", e);
        }
      }

      return token;
    },
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
      try {
        if (account?.provider === "instagram") {
          const instagramId = String(account.providerAccountId);
          const accessToken = (account as any).access_token as string | undefined;

          // Exchange to long-lived token (60 days) before persisting
          let finalAccessToken = accessToken ?? "";
          let expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000);
          if (!finalAccessToken) {
            throw new Error("Missing access token from provider")
          }
          const longLived = await exchangeToLongLivedInstagramToken(
            finalAccessToken,
            process.env.INSTAGRAM_CLIENT_SECRET as string
          );
          if (!longLived?.access_token) {
            throw new Error("Failed to exchange to long-lived token")
          }
          finalAccessToken = longLived.access_token;
          expiresAt = new Date(Date.now() + Number(longLived.expires_in) * 1000);

          const me = await getInstagramMe(finalAccessToken)
          const realInstagramId = me?.user_id
          const profilePictureUrl = me?.profile_picture_url

          // 1) If integration exists, update token and done
          const existingIntegration = await client.integrations.findFirst({
            where: { instagramId: realInstagramId },
          });
          if (existingIntegration) {
            const encrypted = await encryptString(finalAccessToken || existingIntegration.token);
            await client.integrations.update({
              where: { id: existingIntegration.id },
              data: { token: encrypted, expiresAt },
            });

            // Update user's profile picture if we have it
            if (profilePictureUrl && existingIntegration.userId) {
              await client.user.update({
                where: { id: existingIntegration.userId },
                data: { image: profilePictureUrl },
              });
            }

            // Re-subscribe to webhooks on token refresh (non-blocking)
            if (realInstagramId) {
              subscribeToInstagramWebhooks(realInstagramId, finalAccessToken).catch((err) => {
                console.error("[Webhook Subscription] Re-subscription failed:", err);
              });
            }

            return true;
          }

          // 2) Ensure a user exists; try by credentialID first
          const existingUser = await client.user.findFirst({
            where: { credentialID: instagramId },
          });

          let dbUserId: string;
          if (existingUser) {
            dbUserId = existingUser.id;
          } else {
            const fullName = user?.name ?? "";
            const [firstName, ...rest] = fullName.split(" ");
            const lastName = rest.join(" ") || "";
            // Use Instagram profile picture URL if available, otherwise fall back to user.image
            const image = profilePictureUrl || user?.image || "";
            // Instagram often doesn't provide email; generate a placeholder unique email
            const email = user?.email ?? `${instagramId}@instagram.local`;

            const created = await client.user.create({
              data: {
                credentialID: instagramId,
                email,
                firstName: firstName || "Instagram",
                lastName: lastName || "User",
                image,
                subscription: { create: {} },
              },
            });
            dbUserId = created.id;
          }

          // 3) Create integration
          const encrypted = await encryptString(finalAccessToken);
          await client.integrations.create({
            data: {
              userId: dbUserId,
              token: encrypted,
              expiresAt,
              instagramId: realInstagramId || "",
            },
          });

          // 4) Subscribe to webhooks for comments and messages (non-blocking)
          if (realInstagramId) {
            subscribeToInstagramWebhooks(realInstagramId, finalAccessToken).catch((err) => {
              console.error("[Webhook Subscription] Initial subscription failed:", err);
              // Don't fail sign-in if webhook subscription fails
            });
          }
        }
        return true;
      } catch (error) {
        console.error("signIn callback error", error);
        return false;
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // Add additional contact information to session
        try {
          // Only use userId from token (which is the database UUID)
          const userId = (token as any).userId;
          if (userId) {
            const dbUser = await client.user.findUnique({
              where: { id: userId },
              select: {
                additionalEmail: true,
                phone: true,
                image: true,
              },
            });

            if (dbUser) {
              (session.user as any).additionalEmail = dbUser.additionalEmail;
              (session.user as any).id = userId;
              if (dbUser.image) {
                session.user.image = dbUser.image;
              }
            } else {
              // Fallback: still expose the userId even if db fetch failed
              (session.user as any).id = userId;
            }
          }
        } catch (error) {
          console.error("Error fetching user contact info for session:", error);
        }
      }
      // Do not expose provider access tokens to the client
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };