import { createAdminClient } from '@/lib/supabase-admin'

export interface ConnectionRow {
    id: string
    platform: string
    account_id: string | null
    access_token: string | null
    refresh_token: string | null
    fb_user_token: string | null
}

async function saveTokens(connectionId: string, fields: Record<string, unknown>) {
    const { error } = await createAdminClient()
        .from('platform_connections')
        .update(fields)
        .eq('id', connectionId)
    if (error) throw new Error(`Token refreshed but could not be saved: ${error.message}`)
}

export async function refreshInstagramToken(conn: ConnectionRow) {
    if (!conn.access_token) throw new Error('No Instagram token stored')

    const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${conn.access_token}`
    )
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)

    await saveTokens(conn.id, {
        access_token: data.access_token,
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    return { platform: 'instagram', success: true }
}

export async function refreshTikTokToken(conn: ConnectionRow) {
    if (!conn.refresh_token) throw new Error('No TikTok refresh token stored')

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: conn.refresh_token,
        }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error_description || data.error)

    await saveTokens(conn.id, {
        access_token: data.access_token,
        refresh_token: data.refresh_token, // TikTok rotates this — the old one won't work twice
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    return { platform: 'tiktok', success: true }
}

export async function refreshFacebookToken(conn: ConnectionRow) {
    if (!conn.fb_user_token) throw new Error('No Facebook user token stored')

    const extendRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_CLIENT_ID}&client_secret=${process.env.META_CLIENT_SECRET}&fb_exchange_token=${conn.fb_user_token}`
    )
    const extendData = await extendRes.json()
    if (extendData.error) throw new Error(extendData.error.message)

    const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${extendData.access_token}`
    )
    const pagesData = await pagesRes.json()
    const pages: { id: string; access_token: string }[] = pagesData.data ?? []
    // prefer the page that was originally connected; fall back to the first one
    const page = pages.find((p) => p.id === conn.account_id) ?? pages[0]
    if (!page) throw new Error('No Facebook Page found on this token')

    await saveTokens(conn.id, {
        access_token: page.access_token,
        fb_user_token: extendData.access_token,
        token_expires_at: new Date(Date.now() + (extendData.expires_in || 5184000) * 1000).toISOString(),
    })
    return { platform: 'facebook', success: true }
}

export async function refreshConnection(conn: ConnectionRow) {
    switch (conn.platform) {
        case 'instagram':
            return refreshInstagramToken(conn)
        case 'tiktok':
            return refreshTikTokToken(conn)
        case 'facebook':
            return refreshFacebookToken(conn)
        default:
            throw new Error(`${conn.platform} tokens can't be refreshed automatically. Reconnect the account instead.`)
    }
}