import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { syncPostStatus } from '@/lib/postStatus'
import { PLATFORM_IMAGE_LIMITS } from '@/lib/mediaLimits'
import type { Platform } from '@/types'
import { publishToInstagram, publishToLinkedIn, publishToFacebook, publishToTikTok, publishToInstagramReel, publishToTikTokVideo } from '@/lib/publishers'

export async function POST(req: Request) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { platformVersionId, caption: captionOverride, hashtags: hashtagsOverride } = await req.json()

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('*, platform_version_media(position, post_media(url, media_type))')
            .eq('id', platformVersionId)
            .eq('user_id', user.id)
            .single()
        if (versionError || !version) throw new Error('Post version not found')
        if (version.status === 'published') throw new Error('This version is already published')

        const platform = version.platform as Platform
        const attachedMedia = (version.platform_version_media || []).sort(
            (a: { position: number }, b: { position: number }) => a.position - b.position
        )
        const mediaType: 'image' | 'video' = attachedMedia[0]?.post_media?.media_type ?? 'image'
        const limit = PLATFORM_IMAGE_LIMITS[platform] ?? 10
        const imageUrls: string[] = mediaType === 'image'
            ? attachedMedia.map((m: { post_media: { url: string } }) => m.post_media.url).slice(0, limit)
            : []
        const videoUrl: string | undefined = mediaType === 'video' ? attachedMedia[0]?.post_media?.url : undefined

        const captionToUse = captionOverride ?? version.caption
        const hashtagsToUse: string[] = hashtagsOverride ?? version.hashtags ?? []
        const contentToPublish = hashtagsToUse.length > 0
            ? `${captionToUse}\n\n${hashtagsToUse.join(' ')}`
            : captionToUse

        const admin = createAdminClient()
        const { data: connection } = await admin
            .from('platform_connections')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', platform)
            .eq('connected', true)
            .maybeSingle()
        if (!connection?.access_token) {
            throw new Error(`No connected ${platform} account found`)
        }

        let platformPostId: string | null = null

        if (mediaType === 'video') {
            if (platform === 'instagram') {
                platformPostId = await publishToInstagramReel(connection.account_id, connection.access_token, contentToPublish, videoUrl!)
            } else if (platform === 'tiktok') {
                platformPostId = await publishToTikTokVideo(connection.access_token, contentToPublish, videoUrl!)
            } else {
                throw new Error(`Video publishing for ${platform} isn't wired up yet`)
            }
        } else if (platform === 'instagram') {
            platformPostId = await publishToInstagram(connection.account_id, connection.access_token, contentToPublish, imageUrls)
        } else if (platform === 'linkedin') {
            platformPostId = await publishToLinkedIn(connection.account_id, connection.access_token, contentToPublish, imageUrls)
        } else if (platform === 'facebook') {
            platformPostId = await publishToFacebook(connection.account_id, connection.access_token, contentToPublish, imageUrls)
        } else if (platform === 'tiktok') {
            platformPostId = await publishToTikTok(connection.access_token, contentToPublish, imageUrls)
        } else {
            throw new Error(`${platform} publishing not wired yet`)
        }

        const { error: updateError } = await supabase
            .from('platform_versions')
            .update({ status: 'published', published_at: new Date().toISOString(), platform_post_id: platformPostId })
            .eq('id', platformVersionId)
        if (updateError) console.error('Published, but failed to save status:', updateError)

        await syncPostStatus(supabase, version.post_id)

        return NextResponse.json({ success: true, platformPostId })
    } catch (err: unknown) {
        console.error('Publish error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}