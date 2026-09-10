import { supabase } from '@/lib/supabase'
import { generatePerformanceInsight } from '@/lib/ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { platform } = await req.json()

        const { data: versions } = await supabase
            .from('platform_versions')
            .select('*, posts(title), analytics_snapshots(*)')
            .eq('platform', platform)
            .eq('status', 'published')

        const postsData = (versions || [])
            .filter((v: any) => v.analytics_snapshots?.length > 0)
            .map((v: any) => {
                const latest = v.analytics_snapshots.sort(
                    (a: any, b: any) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
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