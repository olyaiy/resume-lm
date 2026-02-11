import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require subscription (but may require auth)
const SUBSCRIPTION_EXEMPT_ROUTES = [
  '/home',
  '/start-trial',
  '/subscription/checkout',
  '/subscription/checkout-return',
  '/auth',
  '/api',
]

function isSubscriptionExemptRoute(pathname: string): boolean {
  return SUBSCRIPTION_EXEMPT_ROUTES.some(route => pathname.startsWith(route))
}

function isFutureDate(value: string | null | undefined): boolean {
  if (!value) return false
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return false
  return parsed > Date.now()
}

export async function updateSession(request: NextRequest) {
  // Debug logging
  console.log('🔍 updateSession running on:', request.nextUrl.pathname)
  const pathname = request.nextUrl.pathname
  
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Debug logging
  console.log('👤 User authenticated:', !!user, 'user_id:', user?.id)

  // Create a new headers object with the existing headers
  // Given an incoming request...
  const requestHeaders = new Headers(request.headers)


  // Create new response with enriched headers
  supabaseResponse = NextResponse.next({
    request: {
      ...request,
      headers: requestHeaders,
    },
  })

  supabaseResponse.cookies.set('show-banner', 'false')

  // Check if user is authenticated and redirect if needed
  if (!user) {
    // Allow access to public routes without a session (avoid redirect loops on '/')
    const isPublicRoute =
      pathname === '/' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/blog')

    if (isPublicRoute) {
      console.log('✅ Allowing unauthenticated access to public route:', pathname)
      return supabaseResponse
    }

    // If no user is authenticated, redirect to the landing page
    console.log('🚫 Redirecting unauthenticated user to landing page')
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Check if route requires subscription
  console.log('🛡️ Route check:', { pathname, isExempt: isSubscriptionExemptRoute(pathname) })

  if (!isSubscriptionExemptRoute(pathname)) {
    // Check if user has an active subscription or trial
    console.log('🧭 Subscription check for path:', pathname)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, subscription_status, current_period_end, trial_end')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('📦 Subscription record:', {
      stripe_subscription_id: subscription?.stripe_subscription_id,
      subscription_status: subscription?.subscription_status,
      current_period_end: subscription?.current_period_end,
      trial_end: subscription?.trial_end,
    })

    const status = subscription?.subscription_status
    const isTrialing = isFutureDate(subscription?.trial_end)
    const isWithinAccessWindow = isFutureDate(subscription?.current_period_end)

    // Access rules for protected routes:
    // - active subscriptions are allowed
    // - canceled subscriptions are allowed only until current_period_end
    // - active trials are always allowed
    const hasProtectedRouteAccess =
      status === 'active' ||
      isTrialing ||
      (status === 'canceled' && isWithinAccessWindow)

    console.log('✅ accessCheck:', {
      status,
      isTrialing,
      isWithinAccessWindow,
      hasProtectedRouteAccess,
    })

    if (!hasProtectedRouteAccess) {
      console.log('🚫 User subscription access expired or invalid, redirecting to home')
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  console.log('✅ User authenticated, allowing access')

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
