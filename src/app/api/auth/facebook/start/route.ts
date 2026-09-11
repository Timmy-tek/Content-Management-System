import { NextResponse } from 'next/server'

export async function GET() {
    const redirectUri = `${process.env.APP_URL}/api/auth/facebook/callback`
    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
    authUrl.searchParams.set('client_id', process.env.META_CLIENT_ID!)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'pages_show_list,pages_manage_posts,pages_read_engagement')
    authUrl.searchParams.set('response_type', 'code')
    return NextResponse.redirect(authUrl.toString())
}