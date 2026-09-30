import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { analyzeContent, adaptForPlatform } from '@/lib/ai'
import { PLATFORM_IMAGE_LIMITS } from '@/lib/mediaLimits'
import { storagePathFromPublicUrl } from '@/lib/storagePath'
import type { Platform } from '@/types'

export async function POST(req: Request) {
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

    let postId: string | null = null

    try {
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
        postId = post.id

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
        console.error('Generate failed, rolling back:', err)

        if (postId) {
            // delete the post row (cascades to post_media / platform_versions / platform_version_media)
            await supabase.from('posts').delete().eq('id', postId)
        }

        // the images for THIS attempt were just uploaded moments ago — nothing else
        // references them yet, so it's safe to remove them from Storage too
        if (imageUrls && imageUrls.length > 0) {
            const paths = imageUrls.map(storagePathFromPublicUrl).filter((p): p is string => !!p)
            if (paths.length > 0) {
                const admin = createAdminClient()
                const { error: removeError } = await admin.storage.from('post-images').remove(paths)
                if (removeError) console.error('Rollback: failed to remove orphaned images:', removeError.message)
            }
        }

        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}