import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
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
    if (tokenData.error) return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?error=token_exchange`);

    // decode the id_token payload to get the member's `sub` (no verification needed here, we trust LinkedIn's direct response)
    const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString());
    const memberUrn = `urn:li:person:${payload.sub}`;

    await supabase.from('platform_connections').upsert(
        {
            platform: 'linkedin',
            connected: true,
            account_id: memberUrn,
            access_token: tokenData.access_token,
            token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        },
        { onConflict: 'platform' }
    );

    return NextResponse.redirect(`${process.env.APP_URL}/settings/accounts?connected=linkedin`);
}