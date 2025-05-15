
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    // Ensure you pass cookies correctly. For App Router, it's a function.
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  // If 'next' is provided and is a relative path, use it.
  // Otherwise, default to the root.
  const redirectPath = (next && next.startsWith('/')) ? next : '/'
  
  // Construct the full redirect URL
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
} 


