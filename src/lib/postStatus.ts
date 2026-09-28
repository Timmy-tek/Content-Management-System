import type { SupabaseClient } from '@supabase/supabase-js'

export async function syncPostStatus(client: SupabaseClient, postId: string) {
    const { data: versions } = await client
        .from('platform_versions')
        .select('status')
        .eq('post_id', postId)

    if (!versions || versions.length === 0) return

    const statuses = versions.map((v) => v.status)
    let overall: string

    if (statuses.every((s) => s === 'published')) overall = 'published'
    else if (statuses.every((s) => s === 'published' || s === 'scheduled')) overall = 'scheduled'
    else if (statuses.every((s) => s === 'published' || s === 'scheduled' || s === 'approved')) overall = 'approved'
    else overall = 'review'

    await client.from('posts').update({ status: overall }).eq('id', postId)
    return overall
}