import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { syncPostStatus } from '@/lib/postStatus'
import { PLATFORM_IMAGE_LIMITS } from '@/lib/mediaLimits'
import type { Platform } from '@/types'
import { publishToInstagram, publishToLinkedIn, publishToFacebook, publishToTikTok, publishToInstagramReel, publishToTikTokVideo } from '@/lib/publishers'

const MAX_ATTEMPTS = 3
const STALE_CLAIM_MINUTES = 5

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const nowIso = new Date().toISOString()
    const staleCutoff = new Date(Date.now() - STALE_CLAIM_MINUTES * 60 * 1000).toISOString()

    const { data: dueVersions } = await admin
        .from('platform_versions')
        .select('*, platform_version_media(position, post_media(url, media_type))')
        .eq('status', 'scheduled')
        .lte('scheduled_at', nowIso)
        .or(`claimed_at.is.null,claimed_at.lt.${staleCutoff}`)

    const results = []

    for (const version of dueVersions || []) {
        const { data: claimed } = await admin
            .from('platform_versions')
            .update({ claimed_at: nowIso })
            .eq('id', version.id)
            .eq('status', 'scheduled')
            .or(`claimed_at.is.null,claimed_at.lt.${staleCutoff}`)
            .select()
            .maybeSingle()

        if (!claimed) continue

        try {
            const { data: connection } = await admin
                .from('platform_connections')
                .select('*')
                .eq('user_id', version.user_id)
                .eq('platform', version.platform)
                .eq('connected', true)
                .maybeSingle()

            if (!connection?.access_token) throw new Error(`No connected ${version.platform} account`)

            const content = version.hashtags?.length > 0
                ? `${version.caption}\n\n${version.hashtags.join(' ')}`
                : version.caption

            // --- NEW MEDIA & PUBLISHING LOGIC ---
            interface AttachedMedia {
                position: number
                post_media: { url: string; media_type: 'image' | 'video' } | null
            }

            const attachedMedia = ((version.platform_version_media || []) as AttachedMedia[]).sort(
                (a, b) => a.position - b.position
            )
            const mediaType: 'image' | 'video' = attachedMedia[0]?.post_media?.media_type ?? 'image'
            const platform = version.platform as Platform
            const limit = PLATFORM_IMAGE_LIMITS[platform] ?? 10

            const imageUrls: string[] = mediaType === 'image'
                ? attachedMedia.map((m) => m.post_media!.url).slice(0, limit)
                : []
            const videoUrl: string | undefined = mediaType === 'video' ? attachedMedia[0]?.post_media?.url : undefined

            let platformPostId: string | null = null

            if (mediaType === 'video') {
                if (platform === 'instagram') {
                    platformPostId = await publishToInstagramReel(connection.account_id, connection.access_token, content, videoUrl!)
                } else if (platform === 'tiktok') {
                    platformPostId = await publishToTikTokVideo(connection.access_token, content, videoUrl!)
                } else {
                    throw new Error(`Video publishing for ${platform} isn't wired up yet`)
                }
            } else if (platform === 'instagram') {
                platformPostId = await publishToInstagram(connection.account_id, connection.access_token, content, imageUrls)
            } else if (platform === 'linkedin') {
                platformPostId = await publishToLinkedIn(connection.account_id, connection.access_token, content, imageUrls)
            } else if (platform === 'facebook') {
                platformPostId = await publishToFacebook(connection.account_id, connection.access_token, content, imageUrls)
            } else if (platform === 'tiktok') {
                platformPostId = await publishToTikTok(connection.access_token, content, imageUrls)
            } else {
                throw new Error(`${platform} publishing not wired yet`)
            }


            const { error: saveError } = await admin
                .from('platform_versions')
                .update({
                    status: 'published',
                    published_at: new Date().toISOString(),
                    platform_post_id: platformPostId,
                    claimed_at: null,
                    last_error: null,
                })
                .eq('id', version.id)

            if (saveError) {
                console.error(
                    `CRITICAL: ${version.platform} post ${platformPostId} (version ${version.id}) is live but the database update failed: ${saveError.message}`
                )
                results.push({ versionId: version.id, platform: version.platform, success: true, warning: 'published but not recorded — check logs' })
                continue
            }

            await syncPostStatus(admin, version.post_id)
            results.push({ versionId: version.id, platform: version.platform, success: true })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Scheduled publish failed'
            const attempts = (version.attempts ?? 0) + 1
            const nextStatus = attempts >= MAX_ATTEMPTS ? 'failed' : 'scheduled'

            await admin
                .from('platform_versions')
                .update({ status: nextStatus, attempts, last_error: message, claimed_at: null })
                .eq('id', version.id)

            if (nextStatus === 'failed') await syncPostStatus(admin, version.post_id)

            results.push({ versionId: version.id, platform: version.platform, success: false, error: message, attempts })
        }
    }

    return NextResponse.json({ processed: results.length, results })
}