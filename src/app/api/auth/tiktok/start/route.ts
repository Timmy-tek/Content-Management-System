import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    const redirectUri = `${process.env.APP_URL}/api/auth/tiktok/callback`;
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', process.env.TIKTOK_CLIENT_KEY!);
    authUrl.searchParams.set('scope', 'user.info.basic,video.publish');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', 'tiktok_connect');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('tiktok_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: true,
        maxAge: 300,
        path: '/',
    });
    return response;
}