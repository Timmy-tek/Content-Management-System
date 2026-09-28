import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { saveConnection } from '@/lib/connections'

export async function POST(req: Request) {
    try {
        const { user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { accessToken, accountId } = await req.json()
        if (!accessToken || !accountId) {
            return NextResponse.json({ error: 'Token and account ID are both required' }, { status: 400 })
        }

        const res = await fetch(
            `https://graph.instagram.com/v21.0/${encodeURIComponent(accountId)}?fields=username,name,followers_count&access_token=${encodeURIComponent(accessToken)}`
        )
        const data = await res.json()
        if (data.error) {
            return NextResponse.json({ error: `Instagram rejected these details: ${data.error.message}` }, { status: 400 })
        }

        const saveError = await saveConnection(user.id, 'instagram', {
            account_id: String(accountId),
            access_token: accessToken,
            account_name: data.name || data.username || null,
            handle: data.username ? `@${data.username}` : null,
            follower_count: data.followers_count ?? null,
            token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        })
        if (saveError) throw new Error(saveError)

        return NextResponse.json({ success: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not save connection'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}