import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const src = url.searchParams.get('src')

    const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-videos/`
    if (!src || !src.startsWith(allowedPrefix)) {
        return NextResponse.json({ error: 'Invalid src' }, { status: 400 })
    }

    const videoRes = await fetch(src)
    if (!videoRes.ok) return NextResponse.json({ error: 'Failed to fetch source video' }, { status: 502 })

    return new NextResponse(videoRes.body, {
        headers: {
            'Content-Type': videoRes.headers.get('content-type') || 'video/mp4',
            'Content-Length': videoRes.headers.get('content-length') || '',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}