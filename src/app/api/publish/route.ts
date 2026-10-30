import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { syncPostStatus } from '@/lib/postStatus'
import { publishVersion } from '@/lib/publishVersion'
import type { PublishMediaItem } from '@/lib/publishVersion'
import type { Platform } from '@/types'

interface AttachedMedia {
    position: number
    post_media: { url: string; media_type: 'image' | 'video' } | null
}

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

        const items: PublishMediaItem[] = ((version.platform_version_media || []) as AttachedMedia[])
            .filter((m) => m.post_media)
            .sort((a, b) => a.position - b.position)
            .map((m) => ({ url: m.post_media!.url, mediaType: m.post_media!.media_type }))

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

        const platformPostId = await publishVersion(platform, connection, contentToPublish, items)

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