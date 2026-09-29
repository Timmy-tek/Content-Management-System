import { PLATFORM_IMAGE_LIMITS } from './mediaLimits'

interface LinkedInPostBody {
    author: string
    lifecycleState: string
    visibility: string
    commentary: string
    distribution: { feedDistribution: string }
    content?: { media?: { id: string }; multiImage?: { images: { id: string }[] } }
}

async function pollInstagramContainer(containerId: string, accessToken: string) {
    let status = 'IN_PROGRESS'
    for (let attempt = 0; attempt < 10; attempt++) {
        const statusRes = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusRes.json()
        status = statusData.status_code

        if (status === 'FINISHED') return
        if (status === 'ERROR') throw new Error('Instagram failed to process the media')

        await new Promise((resolve) => setTimeout(resolve, 3000))
    }
    throw new Error('Instagram is still processing the media — try publishing again in a moment')
}

export async function publishToInstagram(accountId: string, accessToken: string, caption: string, imageUrls: string[]) {
    if (imageUrls.length === 0) throw new Error('Instagram requires at least one image')

    if (imageUrls.length === 1) {
        const containerRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrls[0], caption, access_token: accessToken }),
        })
        const containerData = await containerRes.json()
        if (containerData.error) throw new Error(containerData.error.message)

        await pollInstagramContainer(containerData.id, accessToken)

        const publishRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
        })
        const publishData = await publishRes.json()
        if (publishData.error) throw new Error(publishData.error.message)
        return publishData.id
    }

    // Carousel: 2-10 images. Create one item container per image, wait for each,
    // then a parent CAROUSEL container referencing all of them, then publish that.
    const limited = imageUrls.slice(0, PLATFORM_IMAGE_LIMITS.instagram)
    const childIds: string[] = []

    for (const url of limited) {
        const childRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: accessToken }),
        })
        const childData = await childRes.json()
        if (childData.error) throw new Error(childData.error.message)
        await pollInstagramContainer(childData.id, accessToken)
        childIds.push(childData.id)
    }

    const carouselRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: accessToken }),
    })
    const carouselData = await carouselRes.json()
    if (carouselData.error) throw new Error(carouselData.error.message)
    await pollInstagramContainer(carouselData.id, accessToken)

    const publishRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: carouselData.id, access_token: accessToken }),
    })
    const publishData = await publishRes.json()
    if (publishData.error) throw new Error(publishData.error.message)
    return publishData.id
}

export async function publishToLinkedIn(memberUrn: string, accessToken: string, commentary: string, imageUrls: string[] = []) {
    const limited = imageUrls.slice(0, PLATFORM_IMAGE_LIMITS.linkedin)

    async function uploadOneImage(imageUrl: string): Promise<string> {
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
        const imageUrn = initData.value.image

        const imageRes = await fetch(imageUrl)
        const imageBuffer = await imageRes.arrayBuffer()

        const putRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: Buffer.from(imageBuffer),
        })
        if (!putRes.ok) throw new Error('LinkedIn image upload failed')

        return imageUrn
    }

    const body: LinkedInPostBody = {
        author: memberUrn,
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        commentary,
        distribution: { feedDistribution: 'MAIN_FEED' },
    }

    if (limited.length === 1) {
        const imageUrn = await uploadOneImage(limited[0])
        body.content = { media: { id: imageUrn } }
    } else if (limited.length >= 2) {
        const imageUrns: string[] = []
        for (const url of limited) {
            imageUrns.push(await uploadOneImage(url))
        }
        body.content = { multiImage: { images: imageUrns.map((id) => ({ id })) } }
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

export async function publishToFacebook(pageId: string, pageAccessToken: string, caption: string, imageUrls: string[] = []) {
    const limited = imageUrls.slice(0, PLATFORM_IMAGE_LIMITS.facebook)

    if (limited.length === 0) {
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: caption, access_token: pageAccessToken }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        return data.id
    }

    if (limited.length === 1) {
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: limited[0], caption, access_token: pageAccessToken }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        return data.post_id || data.id
    }

    // Multi-photo: each photo is uploaded unpublished first, then all of them are
    // attached to one /feed post so they show up as a single multi-photo post.
    const photoIds: string[] = []
    for (const url of limited) {
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, published: false, access_token: pageAccessToken }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        photoIds.push(data.id)
    }

    const feedRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: caption,
            attached_media: photoIds.map((id) => ({ media_fbid: id })),
            access_token: pageAccessToken,
        }),
    })
    const feedData = await feedRes.json()
    if (feedData.error) throw new Error(feedData.error.message)
    return feedData.id
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

export async function publishToTikTok(accessToken: string, caption: string, imageUrls: string[]) {
    if (imageUrls.length === 0) throw new Error('TikTok requires at least one image')

    const limited = imageUrls.slice(0, PLATFORM_IMAGE_LIMITS.tiktok)

    const creatorInfo = await getTikTokCreatorInfo(accessToken)
    const allowedPrivacyLevels: string[] = creatorInfo.privacy_level_options || []
    const privacyLevel = allowedPrivacyLevels.includes('SELF_ONLY') ? 'SELF_ONLY' : allowedPrivacyLevels[0]
    if (!privacyLevel) throw new Error('TikTok did not return any valid privacy level for this account')

    const proxiedImageUrls = limited.map(
        (url) => `${process.env.APP_URL}/api/tiktok-image-proxy?src=${encodeURIComponent(url)}`
    )

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
                photo_images: proxiedImageUrls,
            },
            post_mode: 'DIRECT_POST',
            media_type: 'PHOTO',
        }),
    })

    const data = await res.json()
    if (data.error && data.error.code !== 'ok') throw new Error(data.error.message || JSON.stringify(data.error))
    return data.data.publish_id
}