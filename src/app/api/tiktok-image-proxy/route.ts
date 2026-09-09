import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const src = url.searchParams.get('src')
    if (!src) return NextResponse.json({ error: 'Missing src' }, { status: 400 })

    const imageRes = await fetch(src)
    if (!imageRes.ok) return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 })

    const buffer = await imageRes.arrayBuffer()

    const resized = await sharp(Buffer.from(buffer))
        .resize(1080, 1920, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 90 })
        .toBuffer()

    return new NextResponse(resized, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}