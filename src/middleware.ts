import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Pages anyone can open
const PUBLIC_PAGES = ['/login', '/auth/callback']

// API routes that must work without a browser session:
// - the two cron routes authenticate themselves with CRON_SECRET
// - TikTok's servers fetch the image proxy directly
const PUBLIC_API = ['/api/process-scheduled', '/api/refresh-tokens', '/api/tiktok-image-proxy']

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // getUser() validates the token with Supabase (getSession() alone can be spoofed)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isPublic =
        PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
        PUBLIC_API.includes(pathname)

    if (!user && !isPublic) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.search = ''
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (user && pathname === '/login') {
        const home = request.nextUrl.clone()
        home.pathname = '/'
        home.search = ''
        return NextResponse.redirect(home)
    }

    return response
}

export const config = {
    // Skip Next internals and static files (.txt is needed for your TikTok domain-verification file)
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt)$).*)'],
}