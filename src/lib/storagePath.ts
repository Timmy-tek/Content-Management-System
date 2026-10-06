export function storagePathFromPublicUrl(url: string, bucket: string = 'post-images'): string | null {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.slice(idx + marker.length)
}