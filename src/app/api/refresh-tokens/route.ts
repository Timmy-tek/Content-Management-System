import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { refreshConnection } from '@/lib/token-refresh'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: connections } = await admin
        .from('platform_connections')
        .select('id, platform, account_id, access_token, refresh_token, fb_user_token')
        .eq('connected', true)
        .in('platform', ['instagram', 'tiktok', 'facebook'])

    const results = []

    for (const conn of connections || []) {
        try {
            results.push(await refreshConnection(conn))
        } catch (err) {
            results.push({
                platform: conn.platform,
                success: false,
                error: err instanceof Error ? err.message : 'Refresh failed',
            })
        }
    }

    return NextResponse.json({ results })
}