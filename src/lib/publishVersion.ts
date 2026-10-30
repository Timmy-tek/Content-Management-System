import type { Platform } from '@/types'
import { checkPlatformSelection } from './mediaRules'
import type { MediaKind } from './mediaRules'
import {
    publishToInstagram,
    publishToInstagramReel,
    publishToInstagramCarousel,
    publishToLinkedIn,
    publishToLinkedInVideo,
    publishToFacebook,
    publishToFacebookReel,
    publishToTikTok,
    publishToTikTokVideo,
} from './publishers'

export interface PublishMediaItem {
    url: string
    mediaType: MediaKind
}

interface PublishConnection {
    account_id: string
    access_token: string
}

// The one place that decides which publishing function a post's media needs
export async function publishVersion(
    platform: Platform,
    connection: PublishConnection,
    content: string,
    items: PublishMediaItem[]
): Promise<string | null> {
    const problem = checkPlatformSelection(
        platform,
        items.map((i) => i.mediaType)
    )
    if (problem) throw new Error(problem)

    const images = items.filter((i) => i.mediaType === 'image').map((i) => i.url)
    const videos = items.filter((i) => i.mediaType === 'video').map((i) => i.url)
    const hasVideo = videos.length > 0
    const { account_id: accountId, access_token: token } = connection

    switch (platform) {
        case 'instagram':
            if (items.length === 0) throw new Error('Instagram requires at least one image or video')
            if (items.length === 1) {
                return hasVideo
                    ? publishToInstagramReel(accountId, token, content, videos[0])
                    : publishToInstagram(accountId, token, content, images)
            }
            return hasVideo
                ? publishToInstagramCarousel(accountId, token, content, items)
                : publishToInstagram(accountId, token, content, images)

        case 'linkedin':
            return hasVideo
                ? publishToLinkedInVideo(accountId, token, content, videos[0])
                : publishToLinkedIn(accountId, token, content, images)

        case 'facebook':
            return hasVideo
                ? publishToFacebookReel(accountId, token, content, videos[0])
                : publishToFacebook(accountId, token, content, images)

        case 'tiktok':
            if (items.length === 0) throw new Error('TikTok requires at least one image or video')
            return hasVideo
                ? publishToTikTokVideo(token, content, videos[0])
                : publishToTikTok(token, content, images)

        default:
            throw new Error(`${platform} publishing not wired yet`)
    }
}