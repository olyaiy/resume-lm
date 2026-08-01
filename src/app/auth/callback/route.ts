import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

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

function redirectToLogin(
  requestUrl: URL,
  intent: AuthIntent,
  errorCode: string,
  pendingCookies: PendingCookie[] = [],
) {
  const errorUrl = new URL('/auth/login', requestUrl.origin)
  errorUrl.searchParams.set('error', errorCode)
  addAuthIntentToUrl(errorUrl, intent)
  const response = NextResponse.redirect(errorUrl)
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}

function logCallbackFailure(details: Record<string, unknown>) {
  console.error('Google OAuth callback failed:', details)
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const intent = getAuthIntentFromSearchParams(requestUrl.searchParams)
  const providerError = requestUrl.searchParams.get('error')
  const providerErrorCode = requestUrl.searchParams.get('error_code')
  const providerErrorDescription = requestUrl.searchParams.get('error_description')
  const code = requestUrl.searchParams.get('code')

  if (providerError) {
    const errorCode = classifyOAuthError({ providerError })
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
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const errorCode = classifyOAuthError({ message: error.message })
    logCallbackFailure({
      errorCode,
      supabaseCode: error.code ?? null,
      message: error.message,
      status: error.status ?? null,
      name: error.name,
      next: intent.next ?? null,
      plan: intent.plan ?? null,
    })
    return redirectToLogin(requestUrl, intent, errorCode, pendingCookies)
  }

  const redirectPath = getAuthRedirectPath(intent)
  const response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))

  return response
}
