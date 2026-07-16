export interface InstagramServiceConfig {
    baseUrl: string
    apiVersion: string
}

export interface MediaItem {
    id: string
}

export interface PagingCursors {
    before: string
    after: string
}

export interface MediaResponse {
    data: MediaItem[]
    paging?: {
        cursors: PagingCursors
        next?: string
        previous?: string
    }
}

export interface MediaDetails {
    id: string
    media_type?: string
    media_url?: string
    permalink?: string
    timestamp?: string
    username?: string
    caption?: string
    comments_count?: number
    like_count?: number
    alt_text?: string
    thumbnail_url?: string
    shortcode?: string
    is_comment_enabled?: boolean
    is_shared_to_feed?: boolean
    media_product_type?: string
    view_count?: number
    // Add other fields as needed based on API response
}

export interface PersistentMenuButton {
    type: "postback" | "web_url"
    title: string
    payload?: string
    url?: string
    webview_height_ratio?: "full" | "compact" | "tall"
}

export interface PersistentMenuLocale {
    locale: string
    call_to_actions: PersistentMenuButton[]
}

export interface PersistentMenu {
    composer_input_disabled: boolean
    locale: string
    call_to_actions: PersistentMenuButton[]
}

export interface PersistentMenuRequest {
    platform: "instagram"
    persistent_menu: PersistentMenu[]
}

export interface IgMeLinkOptions {
    username: string
    ref?: string  // Optional referral parameter for tracking
}

export type SenderAction = "typing_on" | "typing_off" | "mark_seen"

export interface SenderActionRequest {
    recipient: {
        id: string
    }
    sender_action: SenderAction
}

export interface QuickReply {
    content_type: "text"
    title: string
    payload: string
}

export interface QuickRepliesRequest {
    recipient: {
        id: string
    }
    messaging_type: "RESPONSE"
    message: {
        text: string
        quick_replies: QuickReply[]
    }
}

// ============================================================================
// Webhook Subscription Types
// ============================================================================

/**
 * Instagram webhook fields that can be subscribed to.
 * Each field represents a different type of event that can trigger webhook notifications.
 */
export type InstagramWebhookField =
    | "comments"              // Receive notifications for comments on media
    | "live_comments"         // Receive notifications for comments during live videos
    | "mentions"              // Included in the comments webhook notification
    | "message_echoes"        // Receive echoes of sent messages
    | "message_reactions"     // Receive notifications for message reactions
    | "messages"              // Receive notifications for incoming messages
    | "messaging_handover"    // Notifications for handover protocol events
    | "messaging_optins"      // User opt-in notifications
    | "messaging_policy_enforcement" // Policy enforcement notifications
    | "messaging_postbacks"   // Postback button interaction notifications
    | "messaging_referral"    // Referral notifications
    | "messaging_seen"        // Message read receipts
    | "response_feedback"     // Response feedback notifications
    | "standby"               // Standby mode notifications
    | "story_insights";       // Insights for stories

/**
 * Response from webhook subscription API
 */
export interface WebhookSubscriptionResponse {
    success: boolean
}

/**
 * Parameters for webhook subscription
 */
export interface WebhookSubscriptionParams {
    pageId: string           // Instagram Business Account ID or Facebook Page ID
    accessToken: string      // Page access token
    callbackUrl: string      // Your webhook callback URL
    verifyToken: string      // Token for webhook verification
    fields: InstagramWebhookField[]  // Webhook fields to subscribe to
}

/**
 * Response from subscribed apps endpoint
 */
export interface SubscribedAppsResponse {
    data: Array<{
        category: string
        link: string
        name: string
        id: string
    }>
    success?: boolean
}

export interface InsightsQueryParams {
    metric: string
    period?: "day" | "lifetime"
    timeframe?: "last_14_days" | "last_30_days" | "last_90_days" | "prev_month" | "this_month" | "this_week"
    metric_type?: "time_series" | "total_value"
    breakdown?: string
    since?: number  // Unix timestamp
    until?: number  // Unix timestamp
}

export interface InsightsBreakdownResult {
    dimension_values: string[]
    value: number
    end_time?: string
}

export interface InsightsBreakdown {
    dimension_keys: string[]
    results: InsightsBreakdownResult[]
}

export interface InsightsTotalValue {
    value?: number
    breakdowns?: InsightsBreakdown[]
}

export interface InsightsTimeSeriesValue {
    value: number
    end_time: string
}

export interface InsightsData {
    name: string
    period: string
    title: string
    description: string
    total_value?: InsightsTotalValue
    values?: InsightsTimeSeriesValue[]
    id: string
}

export interface InsightsResponse {
    data: InsightsData[]
    paging?: {
        previous?: string
        next?: string
    }
}

export class InstagramService {
    private baseUrl: string
    private apiVersion: string

    constructor(config?: Partial<InstagramServiceConfig>) {
        this.baseUrl = config?.baseUrl || process.env.INSTAGRAM_API_BASE_URL || 'https://graph.instagram.com'
        this.apiVersion = config?.apiVersion || process.env.INSTAGRAM_API_VERSION || 'v24.0'
    }

    private getApiUrl(endpoint: string): string {
        return `${this.baseUrl}/${this.apiVersion}/${endpoint}`
    }

    async sendDM(accessToken: string, businessId: string, toUserId: string, text: string) {
        if (!businessId || !toUserId || !text || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        const url = this.getApiUrl(`${businessId}/messages`)

        const body = {
            recipient: { id: toUserId },
            message: { text },
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG DM API] Send failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    async sendCommentDM(accessToken: string, businessId: string, commentId: string, text: string) {
        if (!businessId || !commentId || !text || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        const url = this.getApiUrl(`${businessId}/messages`)

        const body = {
            recipient: { comment_id: commentId },
            message: { text },
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG DM API] Send failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    /**
     * Subscribe to Instagram webhook fields for a Page/Instagram Business Account
     * 
     * @param pageId - The Facebook Page ID or Instagram Business Account ID
     * @param accessToken - Page access token with appropriate permissions
     * @param fields - Array of webhook fields to subscribe to
     * @returns Response indicating success or failure
     * 
     * @example
     * ```typescript
     * const result = await instagramService.subscribeToWebhook(
     *   'PAGE_ID',
     *   'ACCESS_TOKEN',
     *   ['messages', 'messaging_postbacks', 'message_reactions']
     * );
     * ```
     */
    async subscribeToWebhook(
        pageId: string,
        accessToken: string,
        fields: InstagramWebhookField[]
    ) {
        if (!pageId || !accessToken || !fields?.length) {
            return { ok: false, error: "Missing required parameters: pageId, accessToken, or fields" }
        }

        // Join fields array into comma-separated string
        const fieldsParam = fields.join(',');

        // Build URL with query parameters using URL class (consistent with other methods)
        const url = new URL(this.getApiUrl(`${pageId}/subscribed_apps`))
        url.searchParams.set("subscribed_fields", fieldsParam)
        url.searchParams.set("access_token", accessToken)

        try {
            const res = await fetch(url.toString(), {
                method: "POST",
            })

            if (!res.ok) {
                const err = await res.text().catch(() => "")
                console.error("[Instagram Webhook API] Subscription failed:", {
                    status: res.status,
                    error: err,
                    pageId,
                    fields: fieldsParam
                });
                return { ok: false, error: err || `status ${res.status}` }
            }

            const json = await res.json() as WebhookSubscriptionResponse
            console.log("[Instagram Webhook API] Successfully subscribed to fields:", fieldsParam);
            return { ok: true, data: json }
        } catch (error) {
            console.error("[Instagram Webhook API] Exception during subscription:", error);
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error occurred"
            }
        }
    }

    /**
     * Get currently subscribed webhook fields for a Page/Instagram Business Account
     * 
     * @param pageId - The Facebook Page ID or Instagram Business Account ID
     * @param accessToken - Page access token
     * @returns List of subscribed apps and their webhook fields
     */
    async getSubscribedWebhookFields(
        pageId: string,
        accessToken: string
    ) {
        if (!pageId || !accessToken) {
            return { ok: false, error: "Missing required parameters: pageId or accessToken" }
        }
        const url = new URL(this.getApiUrl(`${pageId}/subscribed_apps`))
        url.searchParams.set("access_token", accessToken)

        try {
            const res = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            if (!res.ok) {
                const err = await res.text().catch(() => "")
                console.error("[Instagram Webhook API] Get subscriptions failed:", {
                    status: res.status,
                    error: err,
                    pageId
                });
                return { ok: false, error: err || `status ${res.status}` }
            }

            const json = await res.json() as SubscribedAppsResponse
            return { ok: true, data: json }
        } catch (error) {
            console.error("[Instagram Webhook API] Exception getting subscriptions:", error);
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error occurred"
            }
        }
    }

    /**
     * Unsubscribe from specific webhook fields
     * 
     * @param pageId - The Facebook Page ID or Instagram Business Account ID
     * @param accessToken - Page access token
     * @param fields - Array of webhook fields to unsubscribe from (optional, defaults to all)
     * @returns Response indicating success or failure
     */
    async unsubscribeFromWebhook(
        pageId: string,
        accessToken: string,
        fields?: InstagramWebhookField[]
    ) {
        if (!pageId || !accessToken) {
            return { ok: false, error: "Missing required parameters: pageId or accessToken" }
        }

        // Build URL with query parameters using URL class (consistent with other methods)
        const url = new URL(this.getApiUrl(`${pageId}/subscribed_apps`))
        url.searchParams.set("access_token", accessToken)

        if (fields && fields.length > 0) {
            // Unsubscribe from specific fields
            url.searchParams.set("subscribed_fields", fields.join(','))
        }

        try {
            const res = await fetch(url.toString(), {
                method: "DELETE",
            })

            if (!res.ok) {
                const err = await res.text().catch(() => "")
                console.error("[Instagram Webhook API] Unsubscribe failed:", {
                    status: res.status,
                    error: err,
                    pageId,
                    fields: fields?.join(',') || 'all'
                });
                return { ok: false, error: err || `status ${res.status}` }
            }

            const json = await res.json() as WebhookSubscriptionResponse
            console.log("[Instagram Webhook API] Successfully unsubscribed from fields:",
                fields?.join(',') || 'all');
            return { ok: true, data: json }
        } catch (error) {
            console.error("[Instagram Webhook API] Exception during unsubscribe:", error);
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error occurred"
            }
        }
    }

    async sendButtonTemplate(accessToken: string, businessId: string, toUserId: string, text: string, buttons: Array<{
        type: "web_url" | "postback"
        title: string
        url?: string
        payload?: string
    }>) {
        if (!businessId || !toUserId || !text || !buttons?.length || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        const url = this.getApiUrl(`${businessId}/messages`)

        const body = {
            recipient: { id: toUserId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text,
                        buttons: buttons.map(button => {
                            if (button.type === "web_url") {
                                return {
                                    type: "web_url",
                                    url: button.url,
                                    title: button.title
                                }
                            } else {
                                return {
                                    type: "postback",
                                    title: button.title,
                                    payload: button.payload
                                }
                            }
                        })
                    }
                }
            }
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Button Template API] Send failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    async sendGenericTemplate(accessToken: string, businessId: string, toUserId: string, elements: Array<{
        title: string
        image_url: string
        subtitle: string
        default_action?: {
            type: "web_url"
            url: string
        }
        buttons?: Array<{
            type: "web_url" | "postback"
            title: string
            url?: string
            payload?: string
        }>
    }>) {
        if (!businessId || !toUserId || !elements?.length || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        const url = this.getApiUrl(`${businessId}/messages`)

        const body = {
            recipient: { id: toUserId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements.map(element => ({
                            title: element.title,
                            image_url: element.image_url,
                            subtitle: element.subtitle,
                            default_action: element.default_action,
                            buttons: element.buttons?.map(button => {
                                if (button.type === "web_url") {
                                    return {
                                        type: "web_url",
                                        url: button.url,
                                        title: button.title
                                    }
                                } else {
                                    return {
                                        type: "postback",
                                        title: button.title,
                                        payload: button.payload
                                    }
                                }
                            })
                        }))
                    }
                }
            }
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Generic Template API] Send failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    async getUserInfo(accessToken: string, userId: string) {
        const url = new URL(this.getApiUrl(userId))
        url.searchParams.set("fields", "id,username,name")
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG User Info] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body)
    }

    async replyToComment(accessToken: string, commentId: string, message: string) {
        const url = new URL(this.getApiUrl(`${commentId}/replies`))
        url.searchParams.set("message", message)
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), {
            method: "POST"
        })

        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Comment API] Reply failed:", { status: res.status, error: body });
            throw new Error(body || `status ${res.status}`)
        }

        const result = JSON.parse(body);
        return result;
    }

    async getConversations(accessToken: string, igId: string) {
        const url = new URL(this.getApiUrl(`${igId}/conversations`))
        url.searchParams.set("platform", "instagram")
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Conversations] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body)
    }

    async getConversationMessages(accessToken: string, conversationId: string) {
        const url = new URL(this.getApiUrl(conversationId))
        url.searchParams.set("fields", "messages{id,created_time,from,to,message}")
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Messages] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body)
    }

    async getMe(accessToken: string) {
        const url = new URL(this.getApiUrl("me"))
        url.searchParams.set("fields", "user_id,username")
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Me] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body) as { user_id: string; username?: string; id?: string }
    }

    /**
     * Get all media for an Instagram account
     * @param accessToken - Instagram access token
     * @param accountId - Instagram account ID
     * @param cursor - Optional cursor for pagination (use 'after' cursor from previous response)
     * @returns Promise with media response including data and paging information
     */
    async getAccountMedia(accessToken: string, accountId: string, cursor?: string): Promise<MediaResponse> {
        const url = new URL(this.getApiUrl(`${accountId}/media`))
        url.searchParams.set("access_token", accessToken)

        if (cursor) {
            url.searchParams.set("after", cursor)
        }

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Account Media] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body) as MediaResponse
    }

    /**
     * Get detailed information about a specific media item
     * @param accessToken - Instagram access token
     * @param mediaId - Instagram media ID
     * @param fields - Optional comma-separated string of fields to retrieve
     *                 Default: "id,media_type,media_url,permalink,timestamp,username"
     *                 Available: alt_text,caption,comments_count,like_count,media_product_type,
     *                           media_type,media_url,permalink,shortcode,thumbnail_url,timestamp,
     *                           username,is_comment_enabled,is_shared_to_feed,view_count
     * @returns Promise with media details
     */
    async getMediaDetails(accessToken: string, mediaId: string, fields?: string): Promise<MediaDetails> {
        const defaultFields = "id,media_type,media_url,permalink,timestamp,username"
        const url = new URL(this.getApiUrl(mediaId))
        url.searchParams.set("fields", fields || defaultFields)
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Media Details] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body) as MediaDetails
    }

    /**
     * Set a persistent menu for the Instagram business account
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param persistentMenu - Array of persistent menu configurations for different locales
     * @returns Promise with success/error response
     */
    async setPersistentMenu(accessToken: string, businessId: string, persistentMenu: PersistentMenu[]) {
        if (!accessToken || !businessId || !persistentMenu?.length) {
            return { ok: false, error: "missing params" }
        }

        const url = this.getApiUrl(`${businessId}/messenger_profile`)

        const body: PersistentMenuRequest = {
            platform: "instagram",
            persistent_menu: persistentMenu
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Persistent Menu API] Set failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    /**
     * Get the current persistent menu configuration
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @returns Promise with current persistent menu configuration
     */
    async getPersistentMenu(accessToken: string, businessId: string) {
        if (!accessToken || !businessId) {
            return { ok: false, error: "missing params" }
        }

        const url = new URL(this.getApiUrl(`${businessId}/messenger_profile`))
        url.searchParams.set("fields", "persistent_menu")
        url.searchParams.set("platform", "instagram")
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "GET" })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Persistent Menu API] Get failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    /**
     * Delete the persistent menu
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @returns Promise with success/error response
     */
    async deletePersistentMenu(accessToken: string, businessId: string) {
        if (!accessToken || !businessId) {
            return { ok: false, error: "missing params" }
        }

        const url = new URL(this.getApiUrl(`${businessId}/messenger_profile`))
        url.searchParams.set("fields", "persistent_menu")
        url.searchParams.set("platform", "instagram")
        url.searchParams.set("access_token", accessToken)

        const res = await fetch(url.toString(), { method: "DELETE" })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Persistent Menu API] Delete failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    /**
     * Generate an ig.me shortened URL with optional referral parameter
     * @param options - Username and optional ref parameter
     * @returns Formatted ig.me URL
     */
    generateIgMeLink(options: IgMeLinkOptions): string {
        const { username, ref } = options

        if (!username) {
            throw new Error("Username is required for ig.me link")
        }

        // Validate username format (basic validation)
        if (!/^[a-zA-Z0-9._]+$/.test(username)) {
            throw new Error("Username must contain only alphanumeric characters, dots, and underscores")
        }

        let url = `https://ig.me/${username}`

        // Add referral parameter if provided
        if (ref) {
            // Validate ref parameter according to Instagram requirements
            if (ref.length > 2083) {
                throw new Error("Referral parameter must be 2,083 characters or less")
            }

            // Only allow alphanumeric, hyphens, underscores, and equal signs
            if (!/^[a-zA-Z0-9\-_=]+$/.test(ref)) {
                throw new Error("Referral parameter can only contain alphanumeric characters, hyphens, underscores, and equal signs")
            }

            url += `?ref=${encodeURIComponent(ref)}`
        }

        return url
    }

    /**
     * Send a sender action (typing indicator or mark as seen) to a user
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param toUserId - Recipient user ID
     * @param senderAction - The sender action to perform (typing_on, typing_off, mark_seen)
     * @returns Promise with success/error response
     */
    async sendSenderAction(accessToken: string, businessId: string, toUserId: string, senderAction: SenderAction) {
        if (!businessId || !toUserId || !senderAction || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        const url = this.getApiUrl(`${businessId}/messages`)

        const body: SenderActionRequest = {
            recipient: { id: toUserId },
            sender_action: senderAction
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Sender Action API] Send failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    /**
     * Display typing indicator to show the bot is typing
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param toUserId - Recipient user ID
     * @returns Promise with success/error response
     */
    async showTypingIndicator(accessToken: string, businessId: string, toUserId: string) {
        return this.sendSenderAction(accessToken, businessId, toUserId, "typing_on")
    }

    /**
     * Hide typing indicator
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param toUserId - Recipient user ID
     * @returns Promise with success/error response
     */
    async hideTypingIndicator(accessToken: string, businessId: string, toUserId: string) {
        return this.sendSenderAction(accessToken, businessId, toUserId, "typing_off")
    }

    /**
     * Mark the most recent message as seen
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param toUserId - Recipient user ID
     * @returns Promise with success/error response
     */
    async markAsSeen(accessToken: string, businessId: string, toUserId: string) {
        return this.sendSenderAction(accessToken, businessId, toUserId, "mark_seen")
    }

    /**
     * Send a message with typing indicators for better user experience
     * This method shows typing indicator, sends the message, then hides the typing indicator
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param toUserId - Recipient user ID
     * @param text - Message text to send
     * @param typingDelay - Optional delay in milliseconds to show typing indicator (default: 1000)
     * @returns Promise with success/error response
     */
    async sendDMWithTyping(accessToken: string, businessId: string, toUserId: string, text: string, typingDelay: number = 1000) {
        if (!businessId || !toUserId || !text || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        try {
            // Show typing indicator
            const typingResult = await this.showTypingIndicator(accessToken, businessId, toUserId)
            if (!typingResult.ok) {
                console.warn("[IG Typing Indicator] Failed to show typing indicator:", typingResult.error)
            }

            // Wait for natural typing delay
            await new Promise(resolve => setTimeout(resolve, typingDelay))

            // Send the actual message
            const messageResult = await this.sendDM(accessToken, businessId, toUserId, text)

            // Hide typing indicator
            const hideTypingResult = await this.hideTypingIndicator(accessToken, businessId, toUserId)
            if (!hideTypingResult.ok) {
                console.warn("[IG Typing Indicator] Failed to hide typing indicator:", hideTypingResult.error)
            }

            return messageResult
        } catch (error) {
            console.error("[IG DM with Typing] Failed:", error)
            return { ok: false, error: error instanceof Error ? error.message : "Unknown error" }
        }
    }

    /**
     * Send quick replies to a user
     * Quick replies provide a way to present a set of buttons in-conversation for users to reply with
     * @param accessToken - Instagram access token
     * @param businessId - Instagram business account ID
     * @param toUserId - Recipient user ID
     * @param text - The text that will prompt a person to click a quick reply
     * @param quickReplies - Array of quick reply objects (max 13, each title max 20 characters)
     * @returns Promise with success/error response
     */
    async sendQuickReplies(accessToken: string, businessId: string, toUserId: string, text: string, quickReplies: Array<{
        title: string
        payload: string
    }>) {
        if (!businessId || !toUserId || !text || !quickReplies?.length || !accessToken) {
            return { ok: false, error: "missing params" }
        }

        // Validate quick replies constraints
        if (quickReplies.length > 13) {
            return { ok: false, error: "Maximum 13 quick replies allowed" }
        }

        // Validate each quick reply
        for (const reply of quickReplies) {
            if (!reply.title || !reply.payload) {
                return { ok: false, error: "Each quick reply must have title and payload" }
            }
            if (reply.title.length > 20) {
                return { ok: false, error: `Quick reply title "${reply.title}" exceeds 20 character limit` }
            }
        }

        const url = this.getApiUrl(`${businessId}/messages`)

        const body: QuickRepliesRequest = {
            recipient: { id: toUserId },
            messaging_type: "RESPONSE",
            message: {
                text,
                quick_replies: quickReplies.map(reply => ({
                    content_type: "text" as const,
                    title: reply.title,
                    payload: reply.payload
                }))
            }
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.text().catch(() => "")
            console.error("[IG Quick Replies API] Send failed:", { status: res.status, error: err });
            return { ok: false, error: err || `status ${res.status}` }
        }

        const json = await res.json().catch(() => ({}))
        return { ok: true, data: json }
    }

    /**
     * Get insights for an Instagram business or creator account
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param params - Insights query parameters
     * @returns Promise with insights data
     */
    async getInsights(accessToken: string, accountId: string, params: InsightsQueryParams): Promise<InsightsResponse> {
        if (!accessToken || !accountId || !params.metric) {
            throw new Error("Access token, account ID, and metric are required")
        }

        const url = new URL(this.getApiUrl(`${accountId}/insights`))
        url.searchParams.set("metric", params.metric)
        url.searchParams.set("access_token", accessToken)

        // Add optional parameters
        if (params.period) {
            url.searchParams.set("period", params.period)
        }

        if (params.timeframe) {
            url.searchParams.set("timeframe", params.timeframe)
        }

        if (params.metric_type) {
            url.searchParams.set("metric_type", params.metric_type)
        }

        if (params.breakdown) {
            url.searchParams.set("breakdown", params.breakdown)
        }

        if (params.since) {
            url.searchParams.set("since", params.since.toString())
        }

        if (params.until) {
            url.searchParams.set("until", params.until.toString())
        }

        const res = await fetch(url.toString(), { method: "GET" })
        const body = await res.text()

        if (!res.ok) {
            console.error("[IG Insights API] fetch failed", res.status, body)
            throw new Error(body || `status ${res.status}`)
        }

        return JSON.parse(body) as InsightsResponse
    }

    /**
     * Get reach insights with breakdown by media product type
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with reach insights data
     */
    async getReachInsights(accessToken: string, accountId: string, since?: number, until?: number) {
        return this.getInsights(accessToken, accountId, {
            metric: "reach",
            period: "day",
            metric_type: "time_series",
            since,
            until
        })
    }

    /**
     * Get accounts engaged insights
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with accounts engaged insights data
     */
    async getAccountsEngagedInsights(accessToken: string, accountId: string, since?: number, until?: number) {
        return this.getInsights(accessToken, accountId, {
            metric: "accounts_engaged",
            period: "day",
            metric_type: "time_series",
            since,
            until
        })
    }

    /**
     * Get follower demographics insights
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param timeframe - Timeframe for demographics data
     * @param breakdown - Breakdown type (age, city, country, gender)
     * @returns Promise with follower demographics insights data
     */
    async getFollowerDemographics(
        accessToken: string,
        accountId: string,
        timeframe: "last_14_days" | "last_30_days" | "last_90_days" | "prev_month" | "this_month" | "this_week" = "this_month",
        breakdown: "age" | "city" | "country" | "gender" = "country"
    ) {
        return this.getInsights(accessToken, accountId, {
            metric: "follower_demographics",
            period: "lifetime",
            timeframe,
            breakdown,
            metric_type: "total_value"
        })
    }

    /**
     * Get engaged audience demographics insights
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param timeframe - Timeframe for demographics data
     * @param breakdown - Breakdown type (age, city, country, gender)
     * @returns Promise with engaged audience demographics insights data
     */
    async getEngagedAudienceDemographics(
        accessToken: string,
        accountId: string,
        timeframe: "last_14_days" | "last_30_days" | "last_90_days" | "prev_month" | "this_month" | "this_week" = "this_month",
        breakdown: "age" | "city" | "country" | "gender" = "country"
    ) {
        return this.getInsights(accessToken, accountId, {
            metric: "engaged_audience_demographics",
            period: "lifetime",
            timeframe,
            breakdown,
            metric_type: "total_value"
        })
    }

    /**
     * Get profile links taps insights
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with profile links taps insights data
     */
    async getProfileLinksTapsInsights(accessToken: string, accountId: string, since?: number, until?: number) {
        return this.getInsights(accessToken, accountId, {
            metric: "profile_links_taps",
            period: "day",
            breakdown: "contact_button_type",
            metric_type: "total_value",
            since,
            until
        })
    }

    /**
     * Get total interactions insights
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param breakdown - Optional breakdown (media_product_type)
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with total interactions insights data
     */
    async getTotalInteractionsInsights(accessToken: string, accountId: string, breakdown?: string, since?: number, until?: number) {
        return this.getInsights(accessToken, accountId, {
            metric: "total_interactions",
            period: "day",
            breakdown,
            metric_type: "total_value",
            since,
            until
        })
    }

    /**
     * Get follows and unfollows insights
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with follows and unfollows insights data
     */
    async getFollowsAndUnfollowsInsights(accessToken: string, accountId: string, since?: number, until?: number) {
        return this.getInsights(accessToken, accountId, {
            metric: "follows_and_unfollows",
            period: "day",
            breakdown: "follow_type",
            metric_type: "time_series",
            since,
            until
        })
    }

    /**
     * Get multiple interaction metrics in a single request
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param metrics - Array of metric names to fetch
     * @param period - Period for aggregation
     * @param metricType - Metric type (time_series or total_value)
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with multiple metrics insights data
     */
    async getMultipleInsights(
        accessToken: string,
        accountId: string,
        metrics: string[],
        period: "day" | "lifetime" = "day",
        metricType: "time_series" | "total_value" = "total_value",
        since?: number,
        until?: number
    ) {
        return this.getInsights(accessToken, accountId, {
            metric: metrics.join(","),
            period,
            metric_type: metricType,
            since,
            until
        })
    }

    /**
     * Get content performance insights (likes, comments, shares, saves)
     * @param accessToken - Instagram access token
     * @param accountId - Instagram business/creator account ID
     * @param breakdown - Optional breakdown by media_product_type
     * @param since - Start time (Unix timestamp)
     * @param until - End time (Unix timestamp)
     * @returns Promise with content performance insights data
     */
    async getContentPerformanceInsights(accessToken: string, accountId: string, breakdown = true, since?: number, until?: number) {
        return this.getInsights(accessToken, accountId, {
            metric: "likes,comments,shares,saves",
            period: "day",
            breakdown: breakdown ? "media_product_type" : undefined,
            metric_type: "total_value",
            since,
            until
        })
    }

    // ========================================================================
    // Webhook Field Presets
    // ========================================================================

    /**
     * Get recommended webhook fields for messaging-focused applications
     * Includes all essential messaging and interaction fields
     */
    getMessagingWebhookFields(): InstagramWebhookField[] {
        return [
            "messages",
            "message_echoes",
            "message_reactions",
            "messaging_postbacks",
            "messaging_referral",
            "messaging_seen",
            "messaging_handover",
            "messaging_optins",
            "standby"
        ]
    }

    /**
     * Get recommended webhook fields for comment management
     * Includes comments, live comments, and mentions
     */
    getCommentWebhookFields(): InstagramWebhookField[] {
        return [
            "comments",
            "live_comments"
            // mentions are included in comments webhook notification
        ]
    }

    /**
     * Get all available webhook fields
     * Use with caution as this will generate notifications for all events
     */
    getAllWebhookFields(): InstagramWebhookField[] {
        return [
            "comments",
            "live_comments",
            "message_echoes",
            "message_reactions",
            "messages",
            "messaging_handover",
            "messaging_optins",
            "messaging_policy_enforcement",
            "messaging_postbacks",
            "messaging_referral",
            "messaging_seen",
            "response_feedback",
            "standby",
            "story_insights"
        ]
    }

    /**
     * Get webhook fields for Instagram Business API with Instagram Login
     * These are the fields available when using Instagram Business Basic permissions
     */
    getInstagramBusinessWebhookFields(): InstagramWebhookField[] {
        return [
            "comments",
            "live_comments",
            "message_echoes",
            "message_reactions",
            "messages",
            "messaging_handover",
            "messaging_optins",
            "messaging_postbacks",
            "messaging_referral",
            "messaging_seen",
            "standby"
        ]
    }

    /**
     * Get webhook fields for basic Instagram API with Facebook Login
     * These require pages_manage_metadata and other page permissions
     */
    getInstagramBasicWebhookFields(): InstagramWebhookField[] {
        return [
            "message_reactions",
            "messages",
            "messaging_handover",
            "messaging_policy_enforcement",
            "messaging_postbacks",
            "messaging_referral",
            "messaging_seen",
            "response_feedback",
            "standby",
            "story_insights"
        ]
    }

    /**
     * Get webhook fields suitable for customer support/automation use cases
     */
    getCustomerSupportWebhookFields(): InstagramWebhookField[] {
        return [
            "messages",
            "message_reactions",
            "messaging_postbacks",
            "messaging_seen",
            "messaging_handover",
            "standby",
            "comments"
        ]
    }
}
