import { NextResponse } from 'next/server';

export async function GET() {
    const redirectUri = `${process.env.APP_URL}/api/auth/linkedin/callback`;
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email%20w_member_social`;
    return NextResponse.redirect(url);
}