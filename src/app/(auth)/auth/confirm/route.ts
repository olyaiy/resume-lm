import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getSafeRedirectPath } from '@/lib/auth-intent'
import { AnalyticsEvents } from '@/lib/analytics/events'
import { captureServerAnalyticsEvent } from '@/lib/analytics/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next')

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      if (data.user) {
        await captureServerAnalyticsEvent({
          distinctId: data.user.id,
          event: AnalyticsEvents.EmailConfirmationCompleted,
          insertId: `${data.user.id}:email_confirmation_completed`,
          properties: {
            confirmation_type: type,
          },
        });
      }
      // redirect user to specified redirect URL or root of app
      redirect(getSafeRedirectPath(next, '/'))
    }
  }

  // redirect to login page with error parameter
  redirect('/auth/login?error=email_confirmation')
}
