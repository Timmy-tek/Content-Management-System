// src/app/api/publish/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function publishToInstagram(accountId: string, accessToken: string, caption: string, imageUrl: string) {
    const containerRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
    })
    const containerData = await containerRes.json()
    if (containerData.error) throw new Error(containerData.error.message)

    const publishRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
    })
    const publishData = await publishRes.json()
    if (publishData.error) throw new Error(publishData.error.message)

    return publishData.id
}

async function publishToLinkedIn(memberUrn: string, accessToken: string, commentary: string) {
    const res = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Linkedin-Version': '202601',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            author: memberUrn,
            lifecycleState: 'PUBLISHED',
            visibility: 'PUBLIC',
            commentary,
            distribution: { feedDistribution: 'MAIN_FEED' },
        }),
    })

    if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText)
    }

    return res.headers.get('x-restli-id')
}

export async function POST(req: Request) {
    try {
        const { platformVersionId, platform, imageUrl } = await req.json()

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('*')
            .eq('id', platformVersionId)
            .single()
        if (versionError) throw versionError

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
                version.caption,
                imageUrl
            )
        } else if (platform === 'linkedin') {
            platformPostId = await publishToLinkedIn(
                connection.account_id,
                connection.access_token,
                version.caption
            )
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