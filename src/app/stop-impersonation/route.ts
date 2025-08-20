import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET /stop-impersonation
 *
 * Signs out the current (impersonated) session and removes helper cookies.
 * Afterward, the user is redirected to the login page.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/auth/login', request.url))
  response.cookies.delete('is_impersonating')
  response.cookies.delete('impersonated_user_id')

  return response
}
