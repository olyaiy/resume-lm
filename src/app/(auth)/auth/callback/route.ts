import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsEvents } from '@/lib/analytics/events'
import { captureServerAnalyticsEvent } from '@/lib/analytics/server'

import {
  AUTH_ERROR_CODES,
  addAuthIntentToUrl,
  classifyOAuthError,
  getAuthIntentFromSearchParams,
  getAuthRedirectPath,
  type AuthIntent,
} from '@/lib/auth-intent'

type PendingCookie = {
  name: string
  value: string
  options: CookieOptions
}

type PendingHeaders = Record<string, string>

const AUTH_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
  Expires: '0',
  Pragma: 'no-cache',
} as const

function redirectToLogin(
  requestUrl: URL,
  intent: AuthIntent,
  errorCode: string,
  pendingCookies: PendingCookie[] = [],
  pendingHeaders: PendingHeaders = {},
) {
  const errorUrl = new URL('/auth/login', requestUrl.origin)
  errorUrl.searchParams.set('error', errorCode)
  addAuthIntentToUrl(errorUrl, intent)
  const response = NextResponse.redirect(errorUrl)
  Object.entries({ ...AUTH_RESPONSE_HEADERS, ...pendingHeaders }).forEach(([name, value]) =>
    response.headers.set(name, value)
  )
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}

function logCallbackFailure(details: Record<string, unknown>) {
  console.error('Google OAuth callback failed:', details)
}

function isNewOAuthUser(user: {
  created_at?: string
  last_sign_in_at?: string | null
}) {
  const createdAt = Date.parse(user.created_at ?? '')
  const lastSignInAt = Date.parse(user.last_sign_in_at ?? '')
  const now = Date.now()

  return (
    Number.isFinite(createdAt) &&
    Number.isFinite(lastSignInAt) &&
    now - createdAt <= 15 * 60 * 1000 &&
    Math.abs(lastSignInAt - createdAt) <= 2 * 60 * 1000
  )
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const intent = getAuthIntentFromSearchParams(requestUrl.searchParams)
  const providerError = requestUrl.searchParams.get('error')
  const providerErrorCode = requestUrl.searchParams.get('error_code')
  const providerErrorDescription = requestUrl.searchParams.get('error_description')
  const code = requestUrl.searchParams.get('code')

  if (providerError) {
    const errorCode = classifyOAuthError({
      providerError,
      providerErrorCode,
      providerErrorDescription,
    })
    logCallbackFailure({
      errorCode,
      providerError,
      providerErrorCode,
      providerErrorDescription,
      next: intent.next ?? null,
      plan: intent.plan ?? null,
    })
    return redirectToLogin(requestUrl, intent, errorCode)
  }

  if (!code) {
    logCallbackFailure({
      errorCode: AUTH_ERROR_CODES.oauthMissingCode,
      next: intent.next ?? null,
      plan: intent.plan ?? null,
    })
    return redirectToLogin(requestUrl, intent, AUTH_ERROR_CODES.oauthMissingCode)
  }

  const pendingCookies: PendingCookie[] = []
  const pendingHeaders: PendingHeaders = {}
  const flowId = requestUrl.searchParams.get('sb_flow_id') || undefined
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          pendingCookies.push(...cookiesToSet)
          Object.assign(pendingHeaders, headers)
        },
      },
    }
  )

  let exchangeResult: Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>

  try {
    exchangeResult = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth code exchange failed unexpectedly'
    const errorCode = classifyOAuthError({ message })
    logCallbackFailure({
      errorCode,
      message,
      name: error instanceof Error ? error.name : null,
      hasFlowId: Boolean(flowId),
      next: intent.next ?? null,
      plan: intent.plan ?? null,
    })
    return redirectToLogin(requestUrl, intent, errorCode, pendingCookies, pendingHeaders)
  }

  const { error } = exchangeResult

  if (error) {
    const errorCode = classifyOAuthError({
      message: error.message,
      providerErrorCode: error.code,
    })
    logCallbackFailure({
      errorCode,
      supabaseCode: error.code ?? null,
      message: error.message,
      status: error.status ?? null,
      name: error.name,
      hasFlowId: Boolean(flowId),
      next: intent.next ?? null,
      plan: intent.plan ?? null,
    })
    return redirectToLogin(requestUrl, intent, errorCode, pendingCookies, pendingHeaders)
  }

  const oauthUser = exchangeResult.data.session?.user
  if (oauthUser && isNewOAuthUser(oauthUser)) {
    await captureServerAnalyticsEvent({
      distinctId: oauthUser.id,
      event: AnalyticsEvents.SignupCompleted,
      properties: {
        signup_provider: 'google',
      },
    })
  }

  const redirectPath = getAuthRedirectPath(intent)
  const response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
  Object.entries({ ...AUTH_RESPONSE_HEADERS, ...pendingHeaders }).forEach(([name, value]) =>
    response.headers.set(name, value)
  )
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))

  return response
}
