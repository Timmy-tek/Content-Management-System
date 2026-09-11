import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    if (!code) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=no_code`)

    const redirectUri = `${process.env.APP_URL}/api/auth/facebook/callback`

    const shortLivedRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.META_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.META_CLIENT_SECRET}&code=${code}`
    )
    const shortLivedData = await shortLivedRes.json()
    if (shortLivedData.error) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=fb_token`)

    const longLivedRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_CLIENT_ID}&client_secret=${process.env.META_CLIENT_SECRET}&fb_exchange_token=${shortLivedData.access_token}`
    )
    const longLivedData = await longLivedRes.json()

    const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedData.access_token}`
    )
    const pagesData = await pagesRes.json()
    const page = pagesData.data?.[0]
    if (!page) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=no_pages`)

    await supabase.from('platform_connections').upsert(
        {
            platform: 'facebook',
            connected: true,
            account_id: page.id,
            access_token: page.access_token,
            fb_user_token: longLivedData.access_token,
            token_expires_at: new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000).toISOString(),
        },
        { onConflict: 'platform' }
    )

    return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?connected=facebook`)
}