import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  // Supabase may send token as `token_hash` (new) or `code` (older).
  const token_hash = url.searchParams.get('token_hash') ?? url.searchParams.get('code')

  // For email confirmation this is usually "signup". Keep what's sent, but default to signup.
  const type = (url.searchParams.get('type') as EmailOtpType | null) ?? 'signup'

  // Only allow internal redirects like "/home". Anything else falls back to "/".
  const nextParam = url.searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return redirect(next)
    }
  }

  // On failure, send the user to your login page with an error flag
  return redirect('/auth/login?error=email_confirmation')
}
