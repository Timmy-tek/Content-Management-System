import type { Platform, PostMediaItem } from '@/types'
import { PLATFORM_IMAGE_LIMITS } from './mediaLimits'

export type MediaKind = 'image' | 'video'

const MAX_VIDEOS_IN_POOL = 10

// The most items one post can hold across the platforms you've selected
export function maxPoolItems(platforms: Platform[]): number {
    if (platforms.length === 0) return 10
    return Math.max(...platforms.map((p) => PLATFORM_IMAGE_LIMITS[p]))
}

// Checks the whole set of uploads on the New Post page
export function checkPool(platforms: Platform[], kinds: MediaKind[]): string | null {
    const videos = kinds.filter((k) => k === 'video').length
    const images = kinds.length - videos
    const max = maxPoolItems(platforms)

    if (kinds.length > max) return `You can attach up to ${max} items with the platforms you've selected.`
    if (videos > MAX_VIDEOS_IN_POOL) return `At most ${MAX_VIDEOS_IN_POOL} videos can be attached to one post.`

    if (!platforms.includes('instagram')) {
        if (videos > 1) {
            return 'Only Instagram can take more than one video in a post. Remove the extra videos, or select Instagram.'
        }
        if (videos === 1 && images > 0) {
            return 'Only Instagram can mix images and video in one post. Use images or one video, or select Instagram.'
        }
    }
    return null
}

// Checks what one platform is about to publish
export function checkPlatformSelection(platform: Platform, kinds: MediaKind[]): string | null {
    const videos = kinds.filter((k) => k === 'video').length
    const images = kinds.length - videos

    if (platform === 'instagram') {
        if (kinds.length > PLATFORM_IMAGE_LIMITS.instagram) {
            return `instagram allows at most ${PLATFORM_IMAGE_LIMITS.instagram} items in a carousel`
        }
        return null
    }

    if (videos > 1) return `${platform} allows only one video per post`
    if (videos === 1 && images > 0) return `${platform} can't mix images and video in one post`
    if (images > PLATFORM_IMAGE_LIMITS[platform]) {
        return `${platform} allows at most ${PLATFORM_IMAGE_LIMITS[platform]} images`
    }
    return null
}

// What each platform starts with when a post is first generated
export function defaultSelectionFor<T extends { mediaType: MediaKind }>(platform: Platform, pool: T[]): T[] {
    if (platform === 'instagram') return pool.slice(0, PLATFORM_IMAGE_LIMITS.instagram)

    const images = pool.filter((m) => m.mediaType === 'image')
    if (images.length > 0) return images.slice(0, PLATFORM_IMAGE_LIMITS[platform])

    const firstVideo = pool.find((m) => m.mediaType === 'video')
    return firstVideo ? [firstVideo] : []
}

// Used by the Review editor when you tick or untick an item for one platform
export function toggleSelection(
    platform: Platform,
    selected: PostMediaItem[],
    toggled: PostMediaItem
): { items: PostMediaItem[] } | { error: string } {
    if (selected.some((m) => m.id === toggled.id)) {
        return { items: selected.filter((m) => m.id !== toggled.id) }
    }

    if (platform === 'instagram') {
        if (selected.length >= PLATFORM_IMAGE_LIMITS.instagram) {
            return { error: `instagram allows at most ${PLATFORM_IMAGE_LIMITS.instagram} items in a carousel` }
        }
        return { items: [...selected, toggled] }
    }

    // These platforms take images OR one video, so picking across the two switches over
    const hasVideo = selected.some((m) => m.mediaType === 'video')
    if (toggled.mediaType === 'video' || hasVideo) return { items: [toggled] }

    if (selected.length >= PLATFORM_IMAGE_LIMITS[platform]) {
        return { error: `${platform} allows at most ${PLATFORM_IMAGE_LIMITS[platform]} images` }
    }
    return { items: [...selected, toggled] }
}