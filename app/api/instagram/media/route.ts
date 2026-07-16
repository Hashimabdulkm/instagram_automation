import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { client } from "@/lib/prisma"
import { InstagramService } from "@/lib/services/instagram-service"
import { decryptString } from "@/lib/crypto"

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Get session and validate user
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Get Instagram credentials from Integrations table
        const integration = await client.integrations.findFirst({
            where: {
                userId: (session.user as any).id,
                name: "INSTAGRAM"
            }
        })

        if (!integration) {
            return NextResponse.json({ error: "Instagram integration not found" }, { status: 404 })
        }

        // Decrypt the token before using it
        const accessToken = await decryptString(integration.token)

        // 3. Fetch media using InstagramService
        const instagramService = new InstagramService()
        const { searchParams } = new URL(request.url)
        const cursor = searchParams.get("cursor")

        // Get account media
        const mediaResponse = await instagramService.getAccountMedia(
            accessToken,
            integration.instagramId,
            cursor || undefined
        )

        // 4. Fetch details for each media item
        const mediaDetails = await Promise.all(
            mediaResponse.data.map(async (mediaItem: any) => {
                try {
                    const details = await instagramService.getMediaDetails(
                        accessToken,
                        mediaItem.id,
                        "id,media_url,thumbnail_url,permalink,media_type,timestamp"
                    )
                    return details
                } catch (error) {
                    console.error(`Failed to fetch details for media ${mediaItem.id}:`, error)
                    return {
                        id: mediaItem.id,
                        media_url: null,
                        thumbnail_url: null,
                        permalink: null,
                        media_type: null,
                        timestamp: null
                    }
                }
            })
        )

        // 5. Return formatted response
        return NextResponse.json({
            items: mediaDetails,
            nextCursor: mediaResponse.paging?.cursors?.after || null,
            hasMore: !!mediaResponse.paging?.cursors?.after
        })

    } catch (error) {
        console.error("GET /api/instagram/media error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
