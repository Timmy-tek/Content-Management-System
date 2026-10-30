import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { analyzeContent, adaptForPlatform } from '@/lib/ai'
import { defaultSelectionFor } from '@/lib/mediaRules'
import type { MediaKind } from '@/lib/mediaRules'
import { storagePathFromPublicUrl } from '@/lib/storagePath'
import type { Platform } from '@/types'

interface IncomingMedia {
    url: string
    mediaType: MediaKind
}

interface PoolItem {
    id: string
    url: string
    position: number
    mediaType: MediaKind
}

export async function POST(req: Request) {
    const { supabase, user } = await requireUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, contentType, sourceText, primaryGoal, targetAudience, platforms, media } = body as {
        title: string
        contentType: string
        sourceText: string
        primaryGoal?: string
        targetAudience?: string
        platforms: Platform[]
        media?: IncomingMedia[]
    }

    // Only accept files that live in THIS user's own folder in our own storage buckets
    const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
    for (const m of media ?? []) {
        const bucket = m.mediaType === 'video' ? 'post-videos' : 'post-images'
        if (!m.url.startsWith(`${storageBase}/${bucket}/${user.id}/`)) {
            return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })
        }
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

        // The shared pool: every uploaded item, in the order the user arranged them
        const pool: PoolItem[] = []
        if (media && media.length > 0) {
            const rows = media.map((m, index) => ({
                post_id: post.id,
                user_id: user.id,
                url: m.url,
                position: index,
                media_type: m.mediaType,
            }))
            const { data: mediaRows, error: mediaError } = await supabase.from('post_media').insert(rows).select()
            if (mediaError) throw mediaError

            pool.push(
                ...mediaRows
                    .sort((a, b) => a.position - b.position)
                    .map((r) => ({
                        id: r.id as string,
                        url: r.url as string,
                        position: r.position as number,
                        mediaType: r.media_type as MediaKind,
                    }))
            )
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

            // Instagram starts with everything; the others start with images (or one video)
            const assigned = defaultSelectionFor(platform, pool)

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

        return NextResponse.json({ post, postMedia: pool, platformVersions })
    } catch (err: unknown) {
        console.error('Generate failed, rolling back:', err)

        if (postId) await supabase.from('posts').delete().eq('id', postId)

        const admin = createAdminClient()
        const imagePaths = (media ?? [])
            .filter((m) => m.mediaType === 'image')
            .map((m) => storagePathFromPublicUrl(m.url))
            .filter((p): p is string => !!p)
        const videoPaths = (media ?? [])
            .filter((m) => m.mediaType === 'video')
            .map((m) => storagePathFromPublicUrl(m.url, 'post-videos'))
            .filter((p): p is string => !!p)

        if (imagePaths.length > 0) await admin.storage.from('post-images').remove(imagePaths)
        if (videoPaths.length > 0) await admin.storage.from('post-videos').remove(videoPaths)

        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}