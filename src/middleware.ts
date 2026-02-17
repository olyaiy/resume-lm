import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  console.log('🧩 Root middleware invoked for:', request.nextUrl.pathname)
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
     * - api/v1 (JWT-authenticated API routes)
     * - blog (blog section)
     * - image files (svg, png, jpg, etc.)
     * Run on all other routes to protect them
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/v1|blog(?:/.*)?|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
