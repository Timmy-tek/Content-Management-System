import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const codeVerifier = cookies().get('tiktok_code_verifier')?.value;

    if (!code || !codeVerifier) {
        return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=missing_code`);
    }

    const redirectUri = `${process.env.APP_URL}/api/auth/tiktok/callback`;

    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
        console.error('TikTok token exchange failed:', tokenData);
        return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=tiktok_token`);
    }

    await supabase.from('platform_connections').upsert(
        {
            platform: 'tiktok',
            connected: true,
            account_id: tokenData.open_id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        },
        { onConflict: 'platform' }
    );

    return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?connected=tiktok`);
}