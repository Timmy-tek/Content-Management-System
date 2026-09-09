import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const src = url.searchParams.get('src')
    if (!src) return NextResponse.json({ error: 'Missing src' }, { status: 400 })

    const imageRes = await fetch(src)
    if (!imageRes.ok) return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 })

    const buffer = Buffer.from(await imageRes.arrayBuffer())
    const metadata = await sharp(buffer).metadata()

    const isPortrait = (metadata.height || 0) > (metadata.width || 0)
    const maxWidth = isPortrait ? 1080 : 1920
    const maxHeight = isPortrait ? 1920 : 1080

    const resized = await sharp(buffer)
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer()

    return new NextResponse(resized, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}