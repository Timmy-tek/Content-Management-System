import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { user } = await requireUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // This table holds OAuth tokens, so browsers can't read it directly.
    // We return only the safe columns, and only this user's rows.
    const { data, error } = await createAdminClient()
        .from('platform_connections')
        .select('platform, account_name, handle, follower_count, connected, token_expires_at')
        .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ connections: data })
}