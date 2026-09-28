import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { saveConnection } from '@/lib/connections'

export async function GET(req: Request) {
    const { user } = await requireUser()
    if (!user) return NextResponse.redirect(`${process.env.APP_URL}/login`)

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
    if (longLivedData.error) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=fb_token`)

    const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedData.access_token}`
    )
    const pagesData = await pagesRes.json()
    const page = pagesData.data?.[0]
    if (!page) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=no_pages`)

    const pageDetailsRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=name,username,followers_count&access_token=${page.access_token}`
    )
    const pageDetails = await pageDetailsRes.json()

    const saveError = await saveConnection(user.id, 'facebook', {
        account_id: page.id,
        access_token: page.access_token,
        fb_user_token: longLivedData.access_token,
        account_name: pageDetails.name ?? null,
        handle: pageDetails.username ? `@${pageDetails.username}` : pageDetails.name ?? null,
        follower_count: pageDetails.followers_count ?? null,
        token_expires_at: new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000).toISOString(),
    })
    if (saveError) {
        console.error('Failed to save Facebook connection:', saveError)
        return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=save_failed`)
    }

    return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?connected=facebook`)
}