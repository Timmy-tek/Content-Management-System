import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const src = url.searchParams.get('src')
    if (!src) return NextResponse.json({ error: 'Missing src' }, { status: 400 })

    const imageRes = await fetch(src)
    if (!imageRes.ok) return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 })

    const buffer = await imageRes.arrayBuffer()
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(Buffer.from(buffer), {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
        },
    })
}