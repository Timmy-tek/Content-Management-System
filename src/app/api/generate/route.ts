import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { analyzeContent, adaptForPlatform } from '@/lib/ai'
import { PLATFORM_IMAGE_LIMITS } from '@/lib/mediaLimits'
import type { Platform } from '@/types'

export async function POST(req: Request) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { title, contentType, sourceText, primaryGoal, targetAudience, platforms, imageUrls } = body as {
            title: string
            contentType: string
            sourceText: string
            primaryGoal?: string
            targetAudience?: string
            platforms: Platform[]
            imageUrls?: string[]
        }

        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                user_id: user.id,
                title,
                content_type: contentType,
                source_text: sourceText,
                primary_goal: primaryGoal,
                target_audience: targetAudience,
                status: 'review',
            })
            .select()
            .single()
        if (postError) throw postError

        // The shared pool: every uploaded image, in upload order
        const postMedia: { id: string; url: string; position: number }[] = []
        if (imageUrls && imageUrls.length > 0) {
            const rows = imageUrls.map((url, index) => ({ post_id: post.id, user_id: user.id, url, position: index }))
            const { data: mediaRows, error: mediaError } = await supabase.from('post_media').insert(rows).select()
            if (mediaError) throw mediaError
            postMedia.push(...mediaRows.sort((a, b) => a.position - b.position))
        }

        const analysis = await analyzeContent({ title, sourceText, primaryGoal, targetAudience })
        await supabase.from('posts').update({ analysis }).eq('id', post.id)

        const platformVersions = []
        for (const platform of platforms) {
            const adapted = await adaptForPlatform(platform, analysis, primaryGoal, targetAudience)

            const { data: version, error: versionError } = await supabase
                .from('platform_versions')
                .insert({
                    user_id: user.id,
                    post_id: post.id,
                    platform,
                    caption: adapted.caption,
                    hashtags: adapted.hashtags,
                    status: 'review',
                })
                .select()
                .single()
            if (versionError) throw versionError

            // Default: as many of the shared images as this platform actually allows, in order.
            // If you uploaded more than it can take, the rest just aren't assigned yet —
            // fixable per-platform in Review.
            const limit = PLATFORM_IMAGE_LIMITS[platform] ?? 10
            const assigned = postMedia.slice(0, limit)

            if (assigned.length > 0) {
                const attachRows = assigned.map((m, index) => ({
                    platform_version_id: version.id,
                    post_media_id: m.id,
                    user_id: user.id,
                    position: index,
                }))
                const { error: attachError } = await supabase.from('platform_version_media').insert(attachRows)
                if (attachError) throw attachError
            }

            platformVersions.push({ ...version, media: assigned })
        }

        return NextResponse.json({ post, postMedia, platformVersions })
    } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}