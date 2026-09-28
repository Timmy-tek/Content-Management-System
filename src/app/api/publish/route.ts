import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { syncPostStatus } from '@/lib/postStatus'
import { publishToInstagram, publishToLinkedIn, publishToFacebook, publishToTikTok } from '@/lib/publishers'

export async function POST(req: Request) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { platformVersionId, caption: captionOverride, hashtags: hashtagsOverride } = await req.json()

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('*, posts(image_url)')
            .eq('id', platformVersionId)
            .eq('user_id', user.id)
            .single()
        if (versionError || !version) throw new Error('Post version not found')
        if (version.status === 'published') throw new Error('This version is already published')

        const platform: string = version.platform
        const imageUrl: string | undefined = version.posts?.image_url ?? undefined

        const captionToUse = captionOverride ?? version.caption
        const hashtagsToUse: string[] = hashtagsOverride ?? version.hashtags ?? []
        const contentToPublish = hashtagsToUse.length > 0
            ? `${captionToUse}\n\n${hashtagsToUse.join(' ')}`
            : captionToUse

        // Tokens are only readable with the service role, so we scope by user_id by hand
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

        if (platform === 'instagram') {
            if (!imageUrl) throw new Error('Instagram requires an image')
            platformPostId = await publishToInstagram(connection.account_id, connection.access_token, contentToPublish, imageUrl)
        } else if (platform === 'linkedin') {
            platformPostId = await publishToLinkedIn(connection.account_id, connection.access_token, contentToPublish, imageUrl)
        } else if (platform === 'facebook') {
            platformPostId = await publishToFacebook(connection.account_id, connection.access_token, contentToPublish, imageUrl)
        } else if (platform === 'tiktok') {
            if (!imageUrl) throw new Error('TikTok requires an image')
            platformPostId = await publishToTikTok(connection.access_token, contentToPublish, imageUrl)
        } else {
            throw new Error(`${platform} publishing not wired yet`)
        }

        const { error: updateError } = await supabase
            .from('platform_versions')
            .update({ status: 'published', published_at: new Date().toISOString(), platform_post_id: platformPostId })
            .eq('id', platformVersionId)
        // the post IS live at this point, so don't fail the request over a bookkeeping error
        if (updateError) console.error('Published, but failed to save status:', updateError)

        await syncPostStatus(supabase, version.post_id)

        return NextResponse.json({ success: true, platformPostId })
    } catch (err: unknown) {
        console.error('Publish error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}