import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { syncPostStatus } from '@/lib/postStatus'
import { publishToInstagram, publishToLinkedIn, publishToFacebook, publishToTikTok } from '@/lib/publishers'

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
        .select('*, posts(image_url)')
        .eq('status', 'scheduled')
        .lte('scheduled_at', nowIso)
        .or(`claimed_at.is.null,claimed_at.lt.${staleCutoff}`)

    const results = []

    for (const version of dueVersions || []) {
        // Atomic claim: this UPDATE's WHERE clause is checked and applied as one step by
        // Postgres, so if two cron runs overlap, only one of them gets a row back here.
        const { data: claimed } = await admin
            .from('platform_versions')
            .update({ claimed_at: nowIso })
            .eq('id', version.id)
            .eq('status', 'scheduled')
            .or(`claimed_at.is.null,claimed_at.lt.${staleCutoff}`)
            .select()
            .maybeSingle()

        if (!claimed) continue // another run claimed it first

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

            const imageUrl = version.posts?.image_url

            let platformPostId: string | null = null

            if (version.platform === 'instagram') {
                if (!imageUrl) throw new Error('Instagram requires an image')
                platformPostId = await publishToInstagram(connection.account_id, connection.access_token, content, imageUrl)
            } else if (version.platform === 'linkedin') {
                platformPostId = await publishToLinkedIn(connection.account_id, connection.access_token, content, imageUrl)
            } else if (version.platform === 'facebook') {
                platformPostId = await publishToFacebook(connection.account_id, connection.access_token, content, imageUrl)
            } else if (version.platform === 'tiktok') {
                if (!imageUrl) throw new Error('TikTok requires an image')
                platformPostId = await publishToTikTok(connection.access_token, content, imageUrl)
            } else {
                throw new Error(`${version.platform} publishing not wired yet`)
            }

            // The post is live on the platform at this point. A failure past this line can't be
            // retried automatically without risking a duplicate post, so it's only logged, not retried.
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