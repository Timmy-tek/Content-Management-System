import { supabase } from '@/lib/supabase'
import { generatePerformanceInsight } from '@/lib/ai'
import { NextResponse } from 'next/server'


interface AnalyticsSnapshotRow {
    id: string
    platform_version_id: string
    reach: number
    likes: number
    comments: number
    saves: number
    fetched_at: string
}

interface PlatformVersionWithRelations {
    id: string
    platform: string
    caption: string
    hashtags: string[]
    posts: { title: string }
    analytics_snapshots: AnalyticsSnapshotRow[]
}

export async function POST(req: Request) {
    try {
        const { platform } = await req.json()

        const { data: versions } = await supabase
            .from('platform_versions')
            .select('*, posts(title), analytics_snapshots(*)')
            .eq('platform', platform)
            .eq('status', 'published')

        const postsData = ((versions || []) as PlatformVersionWithRelations[])
            .filter((v) => v.analytics_snapshots?.length > 0)
            .map((v) => {
                const latest = v.analytics_snapshots.sort(
                    (a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
                )[0]
                return {
                    title: v.posts.title,
                    caption: v.caption,
                    hashtags: v.hashtags,
                    reach: latest.reach,
                    likes: latest.likes,
                    comments: latest.comments,
                    saves: latest.saves,
                }
            })

        if (postsData.length === 0) {
            return NextResponse.json({ error: 'No published posts with analytics for this platform yet' }, { status: 400 })
        }

        const insight = await generatePerformanceInsight(platform, postsData)

        return NextResponse.json({
            id: `insight-${platform}-${Date.now()}`,
            platform,
            currentPostCount: postsData.length,
            ...insight,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Insight generation failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}