import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { storagePathFromPublicUrl } from '@/lib/storagePath'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const postId = params.id

        // RLS already scopes this to the caller's own posts, but this also confirms
        // the post exists before we go looking for its images
        const { data: mediaRows, error: mediaError } = await supabase
            .from('post_media')
            .select('url')
            .eq('post_id', postId)
        if (mediaError) throw new Error(mediaError.message)

        const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId)
        if (deleteError) throw new Error(deleteError.message)

        if (mediaRows && mediaRows.length > 0) {
            const paths = mediaRows.map((m) => storagePathFromPublicUrl(m.url)).filter((p): p is string => !!p)
            if (paths.length > 0) {
                const admin = createAdminClient()
                const { error: removeError } = await admin.storage.from('post-images').remove(paths)
                // the post is already gone from the database at this point either way,
                // so a Storage hiccup here is logged, not treated as a failed delete
                if (removeError) console.error(`Post ${postId} deleted, but images failed to remove:`, removeError.message)
            }
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}