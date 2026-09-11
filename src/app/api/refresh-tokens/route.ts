import { supabase } from '@/lib/supabase'
import { refreshInstagramToken, refreshTikTokToken, refreshFacebookToken } from '@/lib/token-refresh'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: connections } = await supabase.from('platform_connections').select('*')
    const results = []

    const ig = connections?.find((c) => c.platform === 'instagram' && c.connected)
    if (ig?.access_token) {
        try {
            results.push(await refreshInstagramToken(ig.access_token))
        } catch (err) {
            results.push({ platform: 'instagram', success: false, error: err instanceof Error ? err.message : 'Refresh failed' })
        }
    }

    const tiktok = connections?.find((c) => c.platform === 'tiktok' && c.connected)
    if (tiktok?.refresh_token) {
        try {
            results.push(await refreshTikTokToken(tiktok.refresh_token))
        } catch (err) {
            results.push({ platform: 'tiktok', success: false, error: err instanceof Error ? err.message : 'Refresh failed' })
        }
    }

    const facebook = connections?.find((c) => c.platform === 'facebook' && c.connected)
    if (facebook?.fb_user_token) {
        try {
            results.push(await refreshFacebookToken(facebook.fb_user_token))
        } catch (err) {
            results.push({ platform: 'facebook', success: false, error: err instanceof Error ? err.message : 'Refresh failed' })
        }
    }

    return NextResponse.json({ results })
}