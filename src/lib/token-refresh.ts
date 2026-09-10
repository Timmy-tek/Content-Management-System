import { supabase } from '@/lib/supabase'

export async function refreshInstagramToken(currentToken: string) {
    const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
    )
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)

    await supabase
        .from('platform_connections')
        .update({
            access_token: data.access_token,
            token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        })
        .eq('platform', 'instagram')

    return { platform: 'instagram', success: true }
}

export async function refreshTikTokToken(refreshToken: string) {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error_description || data.error)

    await supabase
        .from('platform_connections')
        .update({
            access_token: data.access_token,
            refresh_token: data.refresh_token, // TikTok rotates this — the old one won't work twice
            token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        })
        .eq('platform', 'tiktok')

    return { platform: 'tiktok', success: true }
}