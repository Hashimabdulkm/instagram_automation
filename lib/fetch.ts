export const refreshToken = async (token: string) => {
    const url = new URL("https://graph.instagram.com/refresh_access_token")
    url.searchParams.set("grant_type", "ig_refresh_token")
    url.searchParams.set("access_token", token)

    const res = await fetch(url.toString(), { method: "GET" })
    const body = await res.text()
    
    if (!res.ok) {
        console.error("[IG OAuth] refresh failed", res.status, body)
        throw new Error(body || `status ${res.status}`)
    }
    
    try {
        const result = JSON.parse(body)
        return result
    } catch (parseError) {
        console.error("[IG OAuth] Failed to parse refresh response:", body)
        throw new Error(`Invalid JSON response: ${parseError}`)
    }
}