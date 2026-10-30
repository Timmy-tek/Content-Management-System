import { PLATFORM_IMAGE_LIMITS } from './mediaLimits'

interface LinkedInPostBody {
    author: string
    lifecycleState: string
    visibility: string
    commentary: string
    distribution: { feedDistribution: string }
    content?: { media?: { id: string }; multiImage?: { images: { id: string }[] } }
}

async function pollInstagramContainer(containerId: string, accessToken: string, maxAttempts = 10, intervalMs = 3000) {
    let status = 'IN_PROGRESS'
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const statusRes = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusRes.json()
        status = statusData.status_code

        if (status === 'FINISHED') return
        if (status === 'ERROR') throw new Error('Instagram failed to process the media')

        await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
    throw new Error('Instagram is still processing the media — try publishing again in a moment')
}

export async function publishToInstagramReel(accountId: string, accessToken: string, caption: string, videoUrl: string) {
    const containerRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'REELS', video_url: videoUrl, caption, access_token: accessToken }),
    })
    const containerData = await containerRes.json()
    if (containerData.error) throw new Error(containerData.error.message)

    await pollInstagramContainer(containerData.id, accessToken, 20, 5000)

    const publishRes = await fetch(`https://graph.instagram.com/v21.0/${accountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
    })
    const publishData = await publishRes.json()
    if (publishData.error) throw new Error(publishData.error.message)
    return publishData.id
}

export async function publishToTikTokVideo(accessToken: string, caption: string, videoUrl: string) {
    const creatorInfo = await getTikTokCreatorInfo(accessToken)
    const allowedPrivacyLevels: string[] = creatorInfo.privacy_level_options || []
    const privacyLevel = allowedPrivacyLevels.includes('SELF_ONLY') ? 'SELF_ONLY' : allowedPrivacyLevels[0]
    if (!privacyLevel) throw new Error('TikTok did not return any valid privacy level for this account')

    const proxiedVideoUrl = `${process.env.APP_URL}/api/tiktok-video-proxy?src=${encodeURIComponent(videoUrl)}`

    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            post_info: { title: caption.slice(0, 90), privacy_level: privacyLevel, disable_comment: false },
            source_info: { source: 'PULL_FROM_URL', video_url: proxiedVideoUrl },
            post_mode: 'DIRECT_POST',
            media_type: 'VIDEO',
        }),
    })

    const data = await res.json()
    if (data.error && data.error.code !== 'ok') throw new Error(data.error.message || JSON.stringify(data.error))
    const publishId: string = data.data.publish_id
    await waitForTikTokPublish(accessToken, publishId)
    return publishId
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
    const publishId: string = data.data.publish_id
    await waitForTikTokPublish(accessToken, publishId)
    return publishId
}

async function waitForTikTokPublish(accessToken: string, publishId: string, maxWaitMs = 90_000) {
    const startedAt = Date.now()

    while (Date.now() - startedAt < maxWaitMs) {
        const res = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ publish_id: publishId }),
        })
        const data = await res.json()
        if (data.error && data.error.code !== 'ok') {
            throw new Error(`TikTok status check failed: ${data.error.message || data.error.code}`)
        }

        const status: string | undefined = data.data?.status
        if (status === 'PUBLISH_COMPLETE') return
        if (status === 'FAILED') {
            throw new Error(`TikTok could not publish this post (${data.data?.fail_reason ?? 'unknown reason'})`)
        }

        await new Promise((resolve) => setTimeout(resolve, 4000))
    }

    // Still processing after the wait. We deliberately don't throw here: TikTok may still
    // finish it, and failing would make the scheduler retry and risk a duplicate post.
}

export async function publishToFacebookReel(pageId: string, pageAccessToken: string, caption: string, videoUrl: string) {
    // Step 1: start an upload session
    const startRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/video_reels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_phase: 'start', access_token: pageAccessToken }),
    })
    const startData = await startRes.json()
    if (startData.error) throw new Error(startData.error.message)

    const videoId: string = startData.video_id
    const uploadUrl: string = startData.upload_url
    if (!videoId || !uploadUrl) throw new Error('Facebook did not return an upload session')

    // Step 2: tell Facebook where to download the video from.
    // This goes to a different host and uses "OAuth", not "Bearer".
    const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { Authorization: `OAuth ${pageAccessToken}`, file_url: videoUrl },
    })
    const uploadData = await uploadRes.json().catch(() => ({}))
    if (!uploadRes.ok || uploadData.success === false || uploadData.error) {
        throw new Error(`Facebook could not fetch the video: ${JSON.stringify(uploadData)}`)
    }

    // Step 3: publish
    const finishRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/video_reels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            upload_phase: 'finish',
            video_id: videoId,
            video_state: 'PUBLISHED',
            description: caption,
            access_token: pageAccessToken,
        }),
    })
    const finishData = await finishRes.json()
    if (finishData.error) throw new Error(finishData.error.message)
    if (!finishData.success) throw new Error(`Facebook did not confirm the Reel: ${JSON.stringify(finishData)}`)

    // Step 4: Facebook keeps processing after "finish", so ask how it went.
    // From here on the Reel is accepted, so network hiccups are ignored (failing now could make
    // the scheduler retry and post a duplicate). Only an explicit error status fails the post.
    const deadline = Date.now() + 60_000
    while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 4000))

        let failed: string | null = null
        try {
            const statusRes = await fetch(`https://graph.facebook.com/v21.0/${videoId}?fields=status&access_token=${pageAccessToken}`)
            const statusData = await statusRes.json()
            const videoStatus: string | undefined = statusData.status?.video_status
            const publishingPhase: string | undefined = statusData.status?.publishing_phase?.status

            if (videoStatus === 'error' || publishingPhase === 'error') failed = JSON.stringify(statusData.status)
            else if (videoStatus === 'ready' || publishingPhase === 'complete') return videoId
        } catch {
            // temporary network problem: keep waiting
        }
        if (failed) throw new Error(`Facebook could not publish this Reel (${failed})`)
    }

    console.warn(`Facebook Reel ${videoId} accepted but still processing after the wait`)
    return videoId
}

export async function publishToLinkedInVideo(memberUrn: string, accessToken: string, commentary: string, videoUrl: string) {
    const baseHeaders = {
        Authorization: `Bearer ${accessToken}`,
        'Linkedin-Version': '202601',
        'X-Restli-Protocol-Version': '2.0.0',
    }

    const videoRes = await fetch(videoUrl)
    if (!videoRes.ok) throw new Error('Could not read the video file from storage')
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer())

    // Step 1: register the upload. LinkedIn answers with one upload address per part.
    const initRes = await fetch('https://api.linkedin.com/rest/videos?action=initializeUpload', {
        method: 'POST',
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            initializeUploadRequest: {
                owner: memberUrn,
                fileSizeBytes: videoBuffer.length,
                uploadCaptions: false,
                uploadThumbnail: false,
            },
        }),
    })
    const initData = await initRes.json()
    if (!initRes.ok) throw new Error(`LinkedIn video init failed: ${JSON.stringify(initData)}`)

    const videoUrn: string = initData.value.video
    const uploadToken: string = initData.value.uploadToken ?? ''
    const parts: { uploadUrl: string; firstByte: number; lastByte: number }[] = initData.value.uploadInstructions

    // Step 2: upload each part and keep its receipt (ETag), in order
    const partIds: string[] = []
    for (const part of parts) {
        const putRes = await fetch(part.uploadUrl, {
            method: 'PUT',
            headers: { ...baseHeaders, 'Content-Type': 'application/octet-stream' },
            body: videoBuffer.subarray(part.firstByte, part.lastByte + 1),
        })
        if (!putRes.ok) throw new Error(`LinkedIn video upload failed (status ${putRes.status})`)

        const etag = putRes.headers.get('etag')
        if (!etag) throw new Error('LinkedIn did not return a receipt for an uploaded part')
        partIds.push(etag.replace(/"/g, ''))
    }

    // Step 3: finalize
    const finalizeRes = await fetch('https://api.linkedin.com/rest/videos?action=finalizeUpload', {
        method: 'POST',
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalizeUploadRequest: { video: videoUrn, uploadToken, uploadedPartIds: partIds } }),
    })
    if (!finalizeRes.ok) throw new Error(`LinkedIn video finalize failed: ${await finalizeRes.text()}`)

    // Step 4: wait until LinkedIn has finished processing the video
    const deadline = Date.now() + 120_000
    let status = ''
    while (Date.now() < deadline) {
        const statusRes = await fetch(`https://api.linkedin.com/rest/videos/${encodeURIComponent(videoUrn)}`, {
            headers: baseHeaders,
        })
        const statusData = await statusRes.json()
        status = statusData.status
        if (status === 'AVAILABLE') break
        if (status === 'PROCESSING_FAILED') throw new Error('LinkedIn could not process this video')
        await new Promise((resolve) => setTimeout(resolve, 4000))
    }
    if (status !== 'AVAILABLE') throw new Error('LinkedIn is still processing the video. Try publishing again in a moment')

    const body: LinkedInPostBody = {
        author: memberUrn,
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        commentary,
        distribution: { feedDistribution: 'MAIN_FEED' },
        content: { media: { id: videoUrn } },
    }

    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!postRes.ok) throw new Error(await postRes.text())

    return postRes.headers.get('x-restli-id')
}