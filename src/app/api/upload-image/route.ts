import sharp from 'sharp'
import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
    try {
        const { user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'That file is not an image' }, { status: 400 })
        }

        const inputBuffer = Buffer.from(await file.arrayBuffer())

        // Convert to JPEG (Instagram only accepts JPEG). rotate() applies the phone's
        // orientation flag before it gets stripped, so photos don't end up sideways.
        const jpegBuffer = await sharp(inputBuffer)
            .rotate()
            .jpeg({ quality: 90 })
            .toBuffer()

        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

        const admin = createAdminClient()
        const { error: uploadError } = await admin.storage
            .from('post-images')
            .upload(fileName, jpegBuffer, { contentType: 'image/jpeg' })

        if (uploadError) throw new Error(uploadError.message)

        const { data } = admin.storage.from('post-images').getPublicUrl(fileName)

        return NextResponse.json({ imageUrl: data.publicUrl })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Image conversion failed'
        console.error('Upload error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}