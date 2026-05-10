
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function getSafeRedirectPath(path: string | null, fallback = '/') {
  if (!path) return fallback
  if (!path.startsWith('/')) return fallback
  if (path.startsWith('//')) return fallback
  return path
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (!code) {
    const errorUrl = new URL('/auth/login', requestUrl.origin)
    errorUrl.searchParams.set('error', 'auth_code_missing')
    return NextResponse.redirect(errorUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth callback failed:', error.message)
    const errorUrl = new URL('/auth/login', requestUrl.origin)
    errorUrl.searchParams.set('error', 'auth_callback_failed')
    return NextResponse.redirect(errorUrl)
  }

  // URL to redirect to after sign in process completes
  // If 'next' is provided and is a relative path, use it.
  // Otherwise, default to the root.
  const redirectPath = getSafeRedirectPath(next)
  
  // Construct the full redirect URL
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
} 

