
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Redirect to login with error indication if code exchange fails
      return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  // If 'next' is provided and is a relative path, use it.
  // Otherwise, default to the root.
  const redirectPath = (next && next.startsWith('/')) ? next : '/'
  
  // Construct the full redirect URL
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
}  


