// src/app/api/publish/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface LinkedInPostBody {
    author: string
    lifecycleState: string
    visibility: string
    commentary: string
    distribution: { feedDistribution: string }
    content?: { media: { id: string } }
}

async function publishToInstagram(accountId: string, accessToken: string, caption: string, imageUrl: string) {
    const containerRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
    })
    const containerData = await containerRes.json()
    if (containerData.error) throw new Error(containerData.error.message)

    const containerId = containerData.id

    // poll until Instagram finishes fetching/processing the image, up to ~30s
    let status = 'IN_PROGRESS'
    for (let attempt = 0; attempt < 10; attempt++) {
        const statusRes = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusRes.json()
        status = statusData.status_code

        if (status === 'FINISHED') break
        if (status === 'ERROR') throw new Error('Instagram failed to process the image')

        await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    if (status !== 'FINISHED') {
        throw new Error('Instagram is still processing the image — try publishing again in a moment')
    }

    const publishRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
    })
    const publishData = await publishRes.json()
    if (publishData.error) throw new Error(publishData.error.message)

    return publishData.id
}

async function publishToLinkedIn(memberUrn: string, accessToken: string, commentary: string, imageUrl?: string) {
    let imageUrn: string | null = null

    if (imageUrl) {
        const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Linkedin-Version': '202601',
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initializeUploadRequest: { owner: memberUrn } }),
        })
        const initData = await initRes.json()
        if (!initRes.ok) throw new Error(`LinkedIn image init failed: ${JSON.stringify(initData)}`)

        const uploadUrl = initData.value.uploadUrl
        imageUrn = initData.value.image

        // fetch the actual image bytes from our own Supabase Storage URL
        const imageRes = await fetch(imageUrl)
        const imageBuffer = await imageRes.arrayBuffer()

        const putRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: Buffer.from(imageBuffer),
        })
        if (!putRes.ok) throw new Error('LinkedIn image upload failed')
    }

    const body: LinkedInPostBody = {
        author: memberUrn,
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        commentary,
        distribution: { feedDistribution: 'MAIN_FEED' },
    }

    if (imageUrn) {
        body.content = { media: { id: imageUrn } }
    }

    const res = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Linkedin-Version': '202601',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
                version.caption,
                imageUrl
            )
        } else if (platform === 'facebook') {
        platformPostId = await publishToFacebook(
            connection.account_id,
            connection.access_token,
            version.caption,
            imageUrl
        )
    } else if (platform === 'tiktok') {
        if (!imageUrl) throw new Error('TikTok requires an image_url')
        platformPostId = await publishToTikTok(connection.access_token, version.caption, imageUrl)
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

async function publishToFacebook(pageId: string, pageAccessToken: string, caption: string, imageUrl?: string) {
    if (imageUrl) {
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl, caption, access_token: pageAccessToken }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        return data.post_id || data.id
    } else {
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: caption, access_token: pageAccessToken }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        return data.id
    }
}

async function publishToTikTok(accessToken: string, caption: string, imageUrl: string) {
    const proxiedImageUrl = `${process.env.APP_URL}/api/tiktok-image-proxy?src=${encodeURIComponent(imageUrl)}`

    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_info: {
                title: caption,
                privacy_level: 'SELF_ONLY',
                disable_comment: false,
            },
            source_info: {
                source: 'PULL_FROM_URL',
                photo_cover_index: 0,
                photo_images: [proxiedImageUrl],
            },
            post_mode: 'DIRECT_POST',
            media_type: 'PHOTO',
        }),
    })

    const data = await res.json()
    if (data.error && data.error.code !== 'ok') throw new Error(data.error.message || JSON.stringify(data.error))

    return data.data.publish_id
}