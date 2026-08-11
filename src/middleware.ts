import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { SITE_URL } from '@/lib/site-config'

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase()
  const canonicalHostname = new URL(SITE_URL).hostname.toLowerCase()

  if (
    hostname !== canonicalHostname &&
    (hostname === 'resumelm.com' || hostname === 'www.resumelm.com')
  ) {
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.protocol = 'https:'
    canonicalUrl.hostname = canonicalHostname
    return NextResponse.redirect(canonicalUrl, 308)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (webhook endpoints)
     * - api/cron (Vercel cron endpoints authenticate with their own secret)
     * - api/ai/model-health (public, read-only health snapshot)
     * - blog (blog section)
     * - public metadata and media files
     * Run on all other routes to protect them
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/webhooks|api/cron|api/ai/model-health|blog(?:/.*)?|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|m4v|ogv)$).*)',
  ],
}
