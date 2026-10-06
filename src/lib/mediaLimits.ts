import type { Platform } from '@/types'

// Instagram (10) and LinkedIn (2–20) are hard limits documented by each platform's API.
// TikTok's photo endpoint documents up to 35 URLs.
// Facebook has no officially documented cap on attached_media — kept conservative until tested for real.
export const PLATFORM_IMAGE_LIMITS: Record<Platform, number> = {
    instagram: 10,
    linkedin: 20,
    tiktok: 35,
    facebook: 10,
}

export function maxImagesFor(platforms: Platform[]): number {
    if (platforms.length === 0) return 10
    return Math.max(...platforms.map((p) => PLATFORM_IMAGE_LIMITS[p]))
}

// Facebook and LinkedIn video (Reels / video upload) land in the next pass.
export const VIDEO_SUPPORTED_PLATFORMS: Platform[] = ['instagram', 'tiktok']