import { supabase } from '@/lib/supabase'
import { analyzeContent, adaptForPlatform } from '@/lib/ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { platformVersionId } = await req.json()

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('*, posts(*)')
            .eq('id', platformVersionId)
            .single()
        if (versionError) throw versionError

        const post = version.posts
        let analysis = post.analysis

        if (!analysis) {
            analysis = await analyzeContent({
                title: post.title,
                sourceText: post.source_text,
                primaryGoal: post.primary_goal,
                targetAudience: post.target_audience,
            })
            await supabase.from('posts').update({ analysis }).eq('id', post.id)
        }

        const adapted = await adaptForPlatform(version.platform, analysis, post.primary_goal, post.target_audience)

        await supabase
            .from('platform_versions')
            .update({ caption: adapted.caption, hashtags: adapted.hashtags })
            .eq('id', platformVersionId)

        return NextResponse.json({ caption: adapted.caption, hashtags: adapted.hashtags })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Regenerate failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}