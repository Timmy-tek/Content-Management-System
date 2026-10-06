import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
    try {
        const { user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { fileName, fileType } = (await req.json()) as { fileName?: string; fileType?: string }
        if (!fileType || !fileType.startsWith('video/')) {
            return NextResponse.json({ error: 'A video file type is required' }, { status: 400 })
        }

        const ext = (fileName?.split('.').pop() || 'mp4').toLowerCase()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const admin = createAdminClient()
        const { data, error } = await admin.storage.from('post-videos').createSignedUploadUrl(path)
        if (error) throw new Error(error.message)

        const { data: publicUrlData } = admin.storage.from('post-videos').getPublicUrl(path)

        return NextResponse.json({ path, token: data.token, publicUrl: publicUrlData.publicUrl })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not create upload URL'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}