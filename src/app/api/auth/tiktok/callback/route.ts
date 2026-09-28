import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireUser } from '@/lib/auth';
import { saveConnection } from '@/lib/connections';

export async function GET(req: Request) {
    const { user } = await requireUser();
    if (!user) return NextResponse.redirect(`${process.env.APP_URL}/login`);

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

    const userInfoRes = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=display_name,username`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    const saveError = await saveConnection(user.id, 'tiktok', {
        account_id: tokenData.open_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        account_name: userInfo.data?.user?.display_name ?? null,
        handle: userInfo.data?.user?.username ? `@${userInfo.data.user.username}` : null,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });
    if (saveError) {
        console.error('Failed to save TikTok connection:', saveError);
        return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=save_failed`);
    }

    return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?connected=tiktok`);
}