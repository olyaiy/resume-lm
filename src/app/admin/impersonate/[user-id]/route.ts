import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { ensureAdmin } from '../../actions' // relative to this file

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

  // 2. Fetch the target user's email so we can generate a magic-link
  const supabaseAdmin = await createServiceClient()
  const { data: authUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(
    targetUserId
  )

  if (fetchError || !authUser) {
    return NextResponse.json(
      { error: fetchError?.message || 'User not found' },
      { status: 404 }
    )
  }

  // 3. Generate a magic-link that signs the admin in **as the target user**.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: authUser.user.email!, // email can be safely asserted – Supabase guarantees it on users
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: linkError?.message || 'Failed to generate impersonation link' },
      { status: 500 }
    )
  }

  const actionLink = linkData.properties.action_link

  // 4. Set helper cookies so we can show an indicator while impersonating
  const response = NextResponse.redirect(actionLink)
  response.cookies.set('is_impersonating', 'true', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour is plenty – adjust as needed
  })
  response.cookies.set('impersonated_user_id', targetUserId, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60,
  })

  return response
}
