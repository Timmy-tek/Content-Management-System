import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'

const PLATFORMS = ['instagram', 'linkedin', 'tiktok', 'facebook']

export async function POST(req: Request) {
    try {
        const { user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { platform } = await req.json()
        if (!PLATFORMS.includes(platform)) {
            return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
        }

        const { error } = await createAdminClient()
            .from('platform_connections')
            .update({
                connected: false,
                access_token: null,
                refresh_token: null,
                fb_user_token: null,
                token_expires_at: null,
                account_id: null,
                account_name: null,
                handle: null,
                follower_count: null,
            })
            .eq('user_id', user.id)
            .eq('platform', platform)

        if (error) throw new Error(error.message)
        return NextResponse.json({ success: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Disconnect failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}