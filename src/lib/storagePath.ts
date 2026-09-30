// Turns a public Supabase Storage URL back into the path storage.remove() needs.
export function storagePathFromPublicUrl(url: string): string | null {
    const marker = '/storage/v1/object/public/post-images/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.slice(idx + marker.length)
}