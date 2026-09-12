// src/app/api/publish/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { publishToInstagram, publishToLinkedIn, publishToFacebook, publishToTikTok } from '@/lib/publishers'

export async function POST(req: Request) {
    try {
        const { platformVersionId, platform, imageUrl, caption: captionOverride, hashtags: hashtagsOverride } = await req.json()

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('*')
            .eq('id', platformVersionId)
            .single()
        if (versionError) throw versionError

        const captionToUse = captionOverride ?? version.caption
        const hashtagsToUse: string[] = hashtagsOverride ?? version.hashtags ?? []
        const contentToPublish = hashtagsToUse.length > 0
            ? `${captionToUse}\n\n${hashtagsToUse.join(' ')}`
            : captionToUse

        const { data: connection, error: connError } = await supabase
            .from('platform_connections')
            .select('*')
            .eq('platform', platform)
            .single()
        if (connError || !connection?.access_token) {
            throw new Error(`No connected ${platform} account found`)
        }

        let platformPostId: string | null = null

        if (platform === 'instagram') {
            if (!imageUrl) throw new Error('Instagram requires an image_url')
            platformPostId = await publishToInstagram(
                connection.account_id, // we'll store this alongside the token
                connection.access_token,
                contentToPublish,
                imageUrl
            )
        } else if (platform === 'linkedin') {
            platformPostId = await publishToLinkedIn(
                connection.account_id,
                connection.access_token,
                contentToPublish,
                imageUrl
            )
        } else if (platform === 'facebook') {
        platformPostId = await publishToFacebook(
            connection.account_id,
            connection.access_token,
            contentToPublish,
            imageUrl
        )
    } else if (platform === 'tiktok') {
        if (!imageUrl) throw new Error('TikTok requires an image_url')
        platformPostId = await publishToTikTok(connection.access_token, contentToPublish, imageUrl)
    } else {
            throw new Error(`${platform} publishing not wired yet`)
        }

        const publishedAt = new Date().toISOString()
        await supabase
            .from('platform_versions')
            .update({ status: 'published', published_at: publishedAt, platform_post_id: platformPostId })
            .eq('id', platformVersionId)

        return NextResponse.json({ success: true, platformPostId })
    } catch (err: unknown) {
        console.error('Publish error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}