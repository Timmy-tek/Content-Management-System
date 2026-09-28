import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { saveConnection } from '@/lib/connections';

export async function GET(req: Request) {
    const { user } = await requireUser();
    if (!user) return NextResponse.redirect(`${process.env.APP_URL}/login`);

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=no_code`);

    const redirectUri = `${process.env.APP_URL}/api/auth/linkedin/callback`;

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: process.env.LINKEDIN_CLIENT_ID!,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.id_token) {
        return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=token_exchange`);
    }

    // decode the id_token payload to get the member's `sub` (no verification needed here, we trust LinkedIn's direct response)
    const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString());
    const memberUrn = `urn:li:person:${payload.sub}`;

    const saveError = await saveConnection(user.id, 'linkedin', {
        account_id: memberUrn,
        account_name: payload.name ?? null,
        access_token: tokenData.access_token,
        handle: payload.email ? payload.email.split('@')[0] : null,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });
    if (saveError) {
        console.error('Failed to save LinkedIn connection:', saveError);
        return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=save_failed`);
    }

    return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?connected=linkedin`);
}