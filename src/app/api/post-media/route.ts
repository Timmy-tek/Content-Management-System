import sharp from 'sharp'
import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { PLATFORM_IMAGE_LIMITS } from '@/lib/mediaLimits'
import type { Platform } from '@/types'

export async function POST(req: Request) {
    try {
        const { supabase, user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const platformVersionId = formData.get('platformVersionId') as string | null

        if (!file || !platformVersionId) {
            return NextResponse.json({ error: 'file and platformVersionId are both required' }, { status: 400 })
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'That file is not an image' }, { status: 400 })
        }

        const { data: version, error: versionError } = await supabase
            .from('platform_versions')
            .select('id, post_id, platform')
            .eq('id', platformVersionId)
            .single()
        if (versionError || !version) return NextResponse.json({ error: 'Post version not found' }, { status: 404 })

        const { count: currentCount } = await supabase
            .from('platform_version_media')
            .select('*', { count: 'exact', head: true })
            .eq('platform_version_id', platformVersionId)

        const limit = PLATFORM_IMAGE_LIMITS[version.platform as Platform] ?? 10
        if ((currentCount ?? 0) >= limit) {
            return NextResponse.json({ error: `${version.platform} allows at most ${limit} images` }, { status: 400 })
        }

        const inputBuffer = Buffer.from(await file.arrayBuffer())
        const jpegBuffer = await sharp(inputBuffer).rotate().jpeg({ quality: 90 }).toBuffer()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

        const admin = createAdminClient()
        const { error: uploadError } = await admin.storage
            .from('post-images')
            .upload(fileName, jpegBuffer, { contentType: 'image/jpeg' })
        if (uploadError) throw new Error(uploadError.message)
        const { data: publicUrlData } = admin.storage.from('post-images').getPublicUrl(fileName)

        const { data: poolRows } = await supabase
            .from('post_media')
            .select('position')
            .eq('post_id', version.post_id)
            .order('position', { ascending: false })
            .limit(1)
        const nextPoolPosition = (poolRows?.[0]?.position ?? -1) + 1

        const { data: mediaRow, error: mediaError } = await supabase
            .from('post_media')
            .insert({ post_id: version.post_id, user_id: user.id, url: publicUrlData.publicUrl, position: nextPoolPosition })
            .select()
            .single()
        if (mediaError) throw new Error(mediaError.message)

        const { error: attachError } = await supabase
            .from('platform_version_media')
            .insert({ platform_version_id: platformVersionId, post_media_id: mediaRow.id, user_id: user.id, position: currentCount ?? 0 })
        if (attachError) throw new Error(attachError.message)

        return NextResponse.json({ media: { id: mediaRow.id, url: mediaRow.url, position: mediaRow.position } })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}