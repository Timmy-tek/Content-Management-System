import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { storagePathFromPublicUrl } from '@/lib/storagePath'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const postId = params.id

        const { data: mediaRows, error: mediaError } = await supabase
            .from('post_media')
            .select('url, media_type')
            .eq('post_id', postId)
        if (mediaError) throw new Error(mediaError.message)

        const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId)
        if (deleteError) throw new Error(deleteError.message)

        if (mediaRows && mediaRows.length > 0) {
            const admin = createAdminClient()

            const imagePaths = mediaRows
                .filter((m) => m.media_type !== 'video')
                .map((m) => storagePathFromPublicUrl(m.url))
                .filter((p): p is string => !!p)

            const videoPaths = mediaRows
                .filter((m) => m.media_type === 'video')
                .map((m) => storagePathFromPublicUrl(m.url, 'post-videos'))
                .filter((p): p is string => !!p)

            // the post is already gone from the database at this point either way,
            // so a Storage hiccup is logged, not treated as a failed delete
            if (imagePaths.length > 0) {
                const { error } = await admin.storage.from('post-images').remove(imagePaths)
                if (error) console.error(`Post ${postId} deleted, but images failed to remove:`, error.message)
            }
            if (videoPaths.length > 0) {
                const { error } = await admin.storage.from('post-videos').remove(videoPaths)
                if (error) console.error(`Post ${postId} deleted, but videos failed to remove:`, error.message)
            }
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}