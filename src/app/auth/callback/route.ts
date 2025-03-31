import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  console.log('🎯 Callback: Received OAuth callback request');
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('🔍 Callback: Checking parameters:', { 
    hasCode: !!code, 
    next,
    origin 
  });

  if (code) {
    console.log('🔄 Callback: Exchanging code for session');
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Callback: Failed to exchange code:', error);
    } else {
      console.log('✅ Callback: Successfully exchanged code for session');
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      console.log('🌐 Callback: Redirect parameters:', { 
        forwardedHost, 
        isLocalEnv, 
        next 
      });

      if (isLocalEnv) {
        console.log('🏠 Callback: Redirecting in local environment');
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        console.log('🔀 Callback: Redirecting with forwarded host');
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        console.log('🎯 Callback: Redirecting with origin');
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  } else {
    console.log('❌ Callback: No code present, redirecting to login page with error');
    return NextResponse.redirect(`${origin}/auth/login?error=auth_code_missing`);
  }
} 


