interface LinkedInPostBody {
    author: string
    lifecycleState: string
    visibility: string
    commentary: string
    distribution: { feedDistribution: string }
    content?: { media: { id: string } }
}

export async function publishToInstagram(accountId: string, accessToken: string, caption: string, imageUrl: string) {
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

export async function publishToLinkedIn(memberUrn: string, accessToken: string, commentary: string, imageUrl?: string) {
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

export async function publishToFacebook(pageId: string, pageAccessToken: string, caption: string, imageUrl?: string) {
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

async function getTikTokCreatorInfo(accessToken: string) {
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
        },
    })
    const data = await res.json()
    if (data.error && data.error.code !== 'ok') throw new Error(`Creator info query failed: ${data.error.message}`)
    return data.data
}

export async function publishToTikTok(accessToken: string, caption: string, imageUrl: string) {
    const creatorInfo = await getTikTokCreatorInfo(accessToken)
    const allowedPrivacyLevels: string[] = creatorInfo.privacy_level_options || []

    // prefer SELF_ONLY if it's actually offered, otherwise just take whatever this account allows
    const privacyLevel = allowedPrivacyLevels.includes('SELF_ONLY')
        ? 'SELF_ONLY'
        : allowedPrivacyLevels[0]

    if (!privacyLevel) throw new Error('TikTok did not return any valid privacy level for this account')

    const proxiedImageUrl = `${process.env.APP_URL}/api/tiktok-image-proxy?src=${encodeURIComponent(imageUrl)}`

    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_info: {
                title: caption.slice(0, 90),
                description: caption,
                privacy_level: privacyLevel,
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
