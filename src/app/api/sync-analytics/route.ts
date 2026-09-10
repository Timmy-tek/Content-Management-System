import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface InstagramInsightMetric {
    name: string
    values: { value: number }[]
}

async function fetchInstagramInsights(mediaId: string, accessToken: string) {
    const res = await fetch(
        `https://graph.instagram.com/v21.0/${mediaId}/insights?metric=reach,likes,comments,saved,shares&access_token=${accessToken}`
    )
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)

    const metrics: Record<string, number> = {}
    data.data.forEach((m: InstagramInsightMetric) => {
        metrics[m.name] = m.values[0].value
    })

    return {
        reach: metrics.reach || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        saves: metrics.saved || 0,
    }
}

interface FacebookPostFields {
    likes?: { summary: { total_count: number } }
    comments?: { summary: { total_count: number } }
}

async function fetchFacebookInsights(postId: string, accessToken: string) {
    const fieldsRes = await fetch(
        `https://graph.facebook.com/v21.0/${postId}?fields=likes.summary(true),comments.summary(true)&access_token=${accessToken}`
    )
    const fieldsData: FacebookPostFields & { error?: { message: string } } = await fieldsRes.json()
    if (fieldsData.error) throw new Error(fieldsData.error.message)

    const insightsRes = await fetch(
        `https://graph.facebook.com/v21.0/${postId}/insights?metric=post_impressions_unique&access_token=${accessToken}`
    )
    const insightsData = await insightsRes.json()
    const reach = insightsData.data?.[0]?.values?.[0]?.value || 0

    return {
        reach,
        likes: fieldsData.likes?.summary.total_count || 0,
        comments: fieldsData.comments?.summary.total_count || 0,
        saves: 0, // Facebook has no equivalent concept
    }
}



export async function POST() {
    const { data: connections } = await supabase.from('platform_connections').select('*')
    const results = []

    for (const platformName of ['instagram', 'facebook']) {
        const connection = connections?.find((c) => c.platform === platformName && c.connected)
        if (!connection) continue

        const { data: publishedVersions } = await supabase
            .from('platform_versions')
            .select('*')
            .eq('platform', platformName)
            .eq('status', 'published')
            .not('platform_post_id', 'is', null)

        for (const version of publishedVersions || []) {
            try {
                const insights = platformName === 'instagram'
                    ? await fetchInstagramInsights(version.platform_post_id, connection.access_token)
                    : await fetchFacebookInsights(version.platform_post_id, connection.access_token)

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
    }

    return NextResponse.json({ results })
}