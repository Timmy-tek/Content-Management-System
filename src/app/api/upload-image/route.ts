import sharp from 'sharp'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const inputBuffer = Buffer.from(arrayBuffer)

        // convert to JPEG regardless of input format (PNG, WebP, HEIC, etc.)
        // and clamp to Instagram's feed aspect ratio range (4:5 to 1.91:1)
        const jpegBuffer = await sharp(inputBuffer)
            .jpeg({ quality: 90 })
            .toBuffer()

        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

        const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, jpegBuffer, { contentType: 'image/jpeg' })

        if (uploadError) throw new Error(uploadError.message)

        const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)

        return NextResponse.json({ imageUrl: data.publicUrl })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Image conversion failed'
        console.error('Upload error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}