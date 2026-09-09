import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { analyzeContent, adaptForPlatform } from '@/lib/ai'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, contentType, sourceText, primaryGoal, targetAudience, platforms, imageUrl  } = body

        // 1. save the post as pending_review
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                title,
                content_type: contentType,
                source_text: sourceText,
                primary_goal: primaryGoal,
                target_audience: targetAudience,
                status: 'review',
                image_url: imageUrl,
            })
            .select()
            .single()

        if (postError) throw postError

        // 2. analyze once
        const analysis = await analyzeContent({ title, sourceText, primaryGoal, targetAudience })
        await supabase.from('posts').update({ analysis }).eq('id', post.id)

        // 3. adapt per platform, save each
        const platformVersions = []
        for (const platform of platforms) {
            const adapted = await adaptForPlatform(platform, analysis, primaryGoal, targetAudience)

            const { data: version, error: versionError } = await supabase
                .from('platform_versions')
                .insert({
                    post_id: post.id,
                    platform,
                    caption: adapted.caption,
                    hashtags: adapted.hashtags,
                    status: 'review',
                })
                .select()
                .single()

            if (versionError) throw versionError
            platformVersions.push(version)
        }

        return NextResponse.json({ post, platformVersions })
    } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}