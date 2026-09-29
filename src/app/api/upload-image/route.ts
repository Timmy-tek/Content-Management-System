import sharp from 'sharp'
import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
    try {
        const { user } = await requireUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await req.formData()
        const files = formData.getAll('files') as File[]

        if (files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: `${file.name} is not an image` }, { status: 400 })
            }
        }

        const admin = createAdminClient()
        const imageUrls: string[] = []

        for (const file of files) {
            const inputBuffer = Buffer.from(await file.arrayBuffer())
            const jpegBuffer = await sharp(inputBuffer).rotate().jpeg({ quality: 90 }).toBuffer()
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

            const { error: uploadError } = await admin.storage
                .from('post-images')
                .upload(fileName, jpegBuffer, { contentType: 'image/jpeg' })
            if (uploadError) throw new Error(uploadError.message)

            const { data } = admin.storage.from('post-images').getPublicUrl(fileName)
            imageUrls.push(data.publicUrl)
        }

        return NextResponse.json({ imageUrls })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Image conversion failed'
        console.error('Upload error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}