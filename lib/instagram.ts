import { client } from "@/lib/prisma"
import { decryptString } from "@/lib/crypto"

type SendDMParams = {
  businessId: string
  toUserId: string
  text: string
}

type SendButtonTemplateParams = {
  businessId: string
  toUserId: string
  text: string
  buttons: Array<{
    type: "web_url" | "postback"
    title: string
    url?: string
    payload?: string
  }>
}

type SendGenericTemplateParams = {
  businessId: string
  toUserId: string
  elements: Array<{
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
  }>
}

export async function sendInstagramDM({ businessId, toUserId, text }: SendDMParams) {
  if (!businessId || !toUserId || !text) {
    return { ok: false, error: "missing params" }
  }

  // Look up access token for this business account
  let integration = await client.integrations.findFirst({ where: { instagramId: String(businessId) } })

  if (!integration?.token) {
    return { ok: false, error: "no access token for business id" }
  }

  // Decrypt the token before using it
  const accessToken = await decryptString(integration.token)

  // Per request: use graph.instagram.com v23.0 with Bearer user token
  const url = `https://graph.instagram.com/v24.0/${businessId}/messages`

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

export async function sendInstagramButtonTemplate({ businessId, toUserId, text, buttons }: SendButtonTemplateParams) {
  if (!businessId || !toUserId || !text || !buttons?.length) {
    return { ok: false, error: "missing params" }
  }

  // Look up access token for this business account
  let integration = await client.integrations.findFirst({ where: { instagramId: String(businessId) } })

  if (!integration?.token) {
    return { ok: false, error: "no access token for business id" }
  }

  // Decrypt the token before using it
  const accessToken = await decryptString(integration.token)

  // Use graph.instagram.com v24.0 with Bearer user token
  const url = `https://graph.instagram.com/v24.0/${businessId}/messages`

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

export async function sendInstagramGenericTemplate({ businessId, toUserId, elements }: SendGenericTemplateParams) {
  if (!businessId || !toUserId || !elements?.length) {
    return { ok: false, error: "missing params" }
  }

  // Look up access token for this business account
  let integration = await client.integrations.findFirst({ where: { instagramId: String(businessId) } })

  if (!integration?.token) {
    return { ok: false, error: "no access token for business id" }
  }

  // Decrypt the token before using it
  const accessToken = await decryptString(integration.token)

  // Use graph.instagram.com v24.0 with Bearer user token
  const url = `https://graph.instagram.com/v24.0/${businessId}/messages`

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

type ExchangeCodeParams = {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}

export async function exchangeInstagramCodeForToken({ clientId, clientSecret, redirectUri, code }: ExchangeCodeParams) {
  const form = new URLSearchParams()
  form.set("client_id", clientId)
  form.set("client_secret", clientSecret)
  form.set("grant_type", "authorization_code")
  form.set("redirect_uri", redirectUri)
  form.set("code", code)

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  })

  const body = await res.text()
  if (!res.ok) {
    console.error("[IG OAuth] token exchange failed", res.status, body)
    throw new Error(body || `status ${res.status}`)
  }

  return JSON.parse(body)
}

export async function exchangeToLongLivedInstagramToken(accessToken: string, clientSecret: string) {
  const url = new URL("https://graph.instagram.com/access_token")
  url.searchParams.set("grant_type", "ig_exchange_token")
  url.searchParams.set("client_secret", clientSecret)
  url.searchParams.set("access_token", accessToken)

  const res = await fetch(url.toString(), { method: "GET" })
  const body = await res.text()
  if (!res.ok) {
    console.error("[IG OAuth] long-lived exchange failed", res.status, body)
    throw new Error(body || `status ${res.status}`)
  }
  return JSON.parse(body)
}

export async function getInstagramConversations(igId: string, accessToken: string) {
  const url = new URL(`https://graph.instagram.com/v23.0/${igId}/conversations`)
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

export async function getConversationMessages(conversationId: string, accessToken: string) {
  const url = new URL(`https://graph.instagram.com/v23.0/${conversationId}`)
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

export async function getInstagramUserInfo(userId: string, accessToken: string) {
  const url = new URL(`https://graph.instagram.com/v23.0/${userId}`)
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


export async function getInstagramMe(accessToken: string) {
  const url = new URL("https://graph.instagram.com/v24.0/me")
  url.searchParams.set("fields", "user_id,username,profile_picture_url")
  url.searchParams.set("access_token", accessToken)

  const res = await fetch(url.toString(), { method: "GET" })
  const body = await res.text()

  if (!res.ok) {
    console.error("[IG Me] fetch failed", res.status, body)
    throw new Error(body || `status ${res.status}`)
  }

  return JSON.parse(body) as { user_id: string; username?: string; id?: string; profile_picture_url?: string }
}


export async function replyToComment(commentId: string, message: string, accessToken: string) {
  const url = new URL(`https://graph.instagram.com/v23.0/${commentId}/replies`)
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


