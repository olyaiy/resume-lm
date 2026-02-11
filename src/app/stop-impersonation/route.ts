import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'
import {
  IMPERSONATION_STATE_COOKIE_NAME,
  parseImpersonationStateCookieValue,
} from '@/lib/impersonation'

function clearImpersonationCookie(response: NextResponse) {
  response.cookies.set(IMPERSONATION_STATE_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
}

/**
 * GET /stop-impersonation
 *
 * Restores the original admin session after impersonation ends.
 *
 * Flow:
 * - Read and verify the signed impersonation cookie
 * - Sign out the currently impersonated session
 * - Generate a magic link for the original admin
 * - Redirect through Supabase callback to restore admin session
 */
export async function GET(request: NextRequest) {
  const stateCookie = request.cookies.get(IMPERSONATION_STATE_COOKIE_NAME)?.value
  const state = parseImpersonationStateCookieValue(stateCookie)

  if (!state) {
    const response = NextResponse.redirect(new URL('/', request.url))
    clearImpersonationCookie(response)
    return response
  }

  const supabase = await createClient()
  await supabase.auth.signOut()

  const supabaseAdmin = await createServiceClient()
  const { data: adminAuthUser, error: adminUserError } = await supabaseAdmin.auth.admin.getUserById(
    state.adminUserId
  )

  if (adminUserError || !adminAuthUser?.user?.email) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    clearImpersonationCookie(response)
    return response
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: adminAuthUser.user.email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/admin`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    clearImpersonationCookie(response)
    return response
  }

  const response = NextResponse.redirect(linkData.properties.action_link)
  clearImpersonationCookie(response)

  return response
}
