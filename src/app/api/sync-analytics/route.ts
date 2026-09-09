import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function fetchInstagramInsights(mediaId: string, accessToken: string) {
    const res = await fetch(
        `https://graph.instagram.com/v21.0/${mediaId}/insights?metric=impressions,reach,likes,comments,saved,shares&access_token=${accessToken}`
    )
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)

    const metrics: Record<string, number> = {}
    data.data.forEach((m: any) => {
        metrics[m.name] = m.values[0].value
    })

    return {
        reach: metrics.reach || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        saves: metrics.saved || 0,
    }
}

export async function POST() {
    const { data: connections } = await supabase.from('platform_connections').select('*')
    const igConnection = connections?.find((c) => c.platform === 'instagram' && c.connected)

    if (!igConnection) {
        return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 })
    }

    const { data: publishedVersions } = await supabase
        .from('platform_versions')
        .select('*')
        .eq('platform', 'instagram')
        .eq('status', 'published')
        .not('platform_post_id', 'is', null)

    const results = []

    for (const version of publishedVersions || []) {
        try {
            const insights = await fetchInstagramInsights(version.platform_post_id, igConnection.access_token)

            await supabase.from('analytics_snapshots').insert({
                platform_version_id: version.id,
                reach: insights.reach,
                likes: insights.likes,
                comments: insights.comments,
                saves: insights.saves,
            })

            results.push({ versionId: version.id, success: true })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sync failed'
            results.push({ versionId: version.id, success: false, error: message })
        }
    }

    return NextResponse.json({ results })
}