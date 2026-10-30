import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { checkPlatformSelection } from '@/lib/mediaRules'
import type { MediaKind } from '@/lib/mediaRules'
import type { Platform } from '@/types'

export async function PATCH(req: Request) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { platformVersionId, postMediaIds } = (await req.json()) as {
            platformVersionId: string
            postMediaIds: string[]
        }
        if (!platformVersionId || !Array.isArray(postMediaIds)) {
            return NextResponse.json({ error: 'platformVersionId and postMediaIds are required' }, { status: 400 })
        }

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('id, post_id, platform')
            .eq('id', platformVersionId)
            .single()
        if (versionError || !version) return NextResponse.json({ error: 'Post version not found' }, { status: 404 })

        // Every id must belong to this post's own pool, and we need each one's type for the rules
        let kinds: MediaKind[] = []
        if (postMediaIds.length > 0) {
            const { data: ownedMedia } = await supabase
                .from('post_media')
                .select('id, media_type')
                .eq('post_id', version.post_id)
                .in('id', postMediaIds)
            if (!ownedMedia || ownedMedia.length !== postMediaIds.length) {
                return NextResponse.json({ error: 'One or more items do not belong to this post' }, { status: 400 })
            }
            const typeById = new Map<string, MediaKind>(
                ownedMedia.map((m) => [m.id as string, m.media_type as MediaKind])
            )
            kinds = postMediaIds.map((id) => typeById.get(id) ?? 'image')
        }

        const problem = checkPlatformSelection(version.platform as Platform, kinds)
        if (problem) return NextResponse.json({ error: problem }, { status: 400 })

        const { error: deleteError } = await supabase
            .from('platform_version_media')
            .delete()
            .eq('platform_version_id', platformVersionId)
        if (deleteError) throw new Error(deleteError.message)

        if (postMediaIds.length > 0) {
            const rows = postMediaIds.map((id, index) => ({
                platform_version_id: platformVersionId,
                post_media_id: id,
                user_id: user.id,
                position: index,
            }))
            const { error: insertError } = await supabase.from('platform_version_media').insert(rows)
            if (insertError) throw new Error(insertError.message)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update media'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}