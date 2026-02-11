import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'
import { ensureAdmin } from '../../actions' // relative to this file
import {
  createImpersonationStateCookieValue,
  IMPERSONATION_STATE_COOKIE_NAME,
  IMPERSONATION_STATE_MAX_AGE_SECONDS,
} from '@/lib/impersonation'

/**
 * GET /admin/impersonate/:user-id
 *
 * - Ensures the current user is an admin
 * - Generates a Supabase magic-link for the target user (no e-mail is sent)
 * - Stores helper cookies so we can show an "impersonating" banner in the UI
 * - Redirects the admin to the generated magic-link. Once the link is
 *   verified by Supabase it will return back to our /auth/callback route,
 *   creating a session for the impersonated user.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ 'user-id': string }> }
) {
  const params = await context.params
  const targetUserId = params['user-id']

  if (!targetUserId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  // 1. Re-authenticate that the current caller is an admin
  await ensureAdmin()

  // 2. Read the currently authenticated admin user ID
  const supabase = await createClient()
  const {
    data: { user: adminUser },
    error: adminUserError,
  } = await supabase.auth.getUser()

  if (adminUserError || !adminUser) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }

  if (adminUser.id === targetUserId) {
    return NextResponse.json({ error: 'Cannot impersonate current user' }, { status: 400 })
  }

  // 3. Fetch the target user's email so we can generate a magic-link
  const supabaseAdmin = await createServiceClient()
  const { data: authUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(
    targetUserId
  )

  if (fetchError || !authUser?.user?.email) {
    return NextResponse.json(
      { error: fetchError?.message || 'User not found' },
      { status: 404 }
    )
  }

  // 4. Generate a magic-link that signs the admin in **as the target user**.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: authUser.user.email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/home`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: linkError?.message || 'Failed to generate impersonation link' },
      { status: 500 }
    )
  }

  const actionLink = linkData.properties.action_link

  const impersonationState = createImpersonationStateCookieValue({
    adminUserId: adminUser.id,
    impersonatedUserId: targetUserId,
    maxAgeSeconds: IMPERSONATION_STATE_MAX_AGE_SECONDS,
  })

  // 5. Set secure helper cookie so we can safely restore the admin session
  const response = NextResponse.redirect(actionLink)
  response.cookies.set(IMPERSONATION_STATE_COOKIE_NAME, impersonationState, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: IMPERSONATION_STATE_MAX_AGE_SECONDS,
  })

  return response
}
