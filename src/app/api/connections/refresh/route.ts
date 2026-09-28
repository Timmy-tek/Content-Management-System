import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { refreshConnection } from '@/lib/token-refresh'

export async function POST(req: Request) {
    try {
        const { user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { platform } = await req.json()

        const { data: conn } = await createAdminClient()
            .from('platform_connections')
            .select('id, platform, account_id, access_token, refresh_token, fb_user_token')
            .eq('user_id', user.id)
            .eq('platform', platform)
            .eq('connected', true)
            .maybeSingle()

        if (!conn) return NextResponse.json({ error: 'No connected account for that platform' }, { status: 404 })

        await refreshConnection(conn)
        return NextResponse.json({ success: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Refresh failed'
        return NextResponse.json({ error: message }, { status: 400 })
    }
}