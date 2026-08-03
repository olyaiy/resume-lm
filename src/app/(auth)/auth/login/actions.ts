'use server'

import { createClient, createServiceClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAuthenticatedClient, getServiceClient } from "@/utils/actions/utils/supabase";
import { deleteCustomerAndData } from "@/utils/actions/stripe/actions";
import { loginSchema, signupSchema } from "@/lib/auth-schemas";
import type { AuthFormState } from "@/components/auth/auth-form-state";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { captureServerAnalyticsEvent } from "@/lib/analytics/server";
import { getEmailSignupBlockedMessage, isEmailSignupAllowed } from "@/lib/auth-policy";
import {
  AUTH_ERROR_CODES,
  buildAuthCallbackUrl,
  getAuthRedirectPath,
  getAuthIntentFromParams,
  getSafeRedirectPath,
  type AuthIntent,
} from "@/lib/auth-intent";
import { siteUrl } from "@/lib/site-config";

// Auto-create Pro subscription for new users (for local development)
const AUTO_PRO_SUBSCRIPTION = process.env.AUTO_PRO_SUBSCRIPTION === 'true';

export interface AuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

export interface OAuthAuthResult extends AuthResult {
  url?: string;
}

function mapLoginErrorMessage(message?: string): string {
  if (!message) return "Unable to sign in right now. Please try again.";

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Invalid credentials. If you just signed up, check your email for a verification link.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (normalized.includes("too many requests")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  return message;
}

// Login
export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Password sign-in failed:', {
      code: error.code ?? null,
      message: error.message,
      status: error.status ?? null,
      name: error.name,
    });
    return { success: false, error: mapLoginErrorMessage(error.message), errorCode: error.code };
  }

  const next = getAuthRedirectPath(getAuthIntentFromParams({
    next: formData.get('next') as string | null,
    plan: formData.get('plan') as string | null,
  }));
  redirect(next)
  return { success: true }
}

// Signup
export async function signup(formData: FormData): Promise<AuthResult> {
  if (!isEmailSignupAllowed()) {
    return { success: false, error: getEmailSignupBlockedMessage() };
  }

  const supabase = await createServiceClient();

  const callbackUrl = new URL('/auth/confirm', siteUrl());
  const safeNext = getSafeRedirectPath(formData.get('next') as string | null, '');
  if (safeNext) callbackUrl.searchParams.set('next', safeNext);

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
      },
      emailRedirectTo: callbackUrl.toString()
    }
  }
  const { data: signupData, error: signupError } = await supabase.auth.signUp(data);

  if (signupError) {
    // Log detailed error information
    console.error('Signup Error Details:', {
      code: signupError.code,
      message: signupError.message,
      status: signupError.status,
      name: signupError.name
    });
    return { success: false, error: signupError.message }
  }

  // In production, subscriptions are managed via Stripe webhooks
  if (signupData.user && AUTO_PRO_SUBSCRIPTION) {
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: signupData.user.id,
        subscription_plan: 'pro',
        subscription_status: 'active',
      }, { onConflict: 'user_id' });

    if (subscriptionError) {
      console.warn('Failed to create pro subscription:', subscriptionError.message);
      // Don't fail signup if subscription creation fails
    }
  }

  if (signupData.user) {
    await captureServerAnalyticsEvent({
      distinctId: signupData.user.id,
      event: AnalyticsEvents.SignupCompleted,
      properties: {
        signup_provider: "email",
      },
    });
  }

  return { success: true }
} 

export async function loginWithState(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsedData = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsedData.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsedData.error.flatten().fieldErrors,
    };
  }

  const result = await login(formData);
  if (!result.success) {
    return {
      status: "error",
      message: mapLoginErrorMessage(result.error),
    };
  }

  return { status: "success" };
}

export async function signupWithState(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isEmailSignupAllowed()) {
    return {
      status: "error",
      message: getEmailSignupBlockedMessage(),
    };
  }

  const parsedData = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsedData.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsedData.error.flatten().fieldErrors,
    };
  }

  const result = await signup(formData);
  if (!result.success) {
    return {
      status: "error",
      message: result.error ?? "Failed to create your account.",
    };
  }

  return {
    status: "success",
    message: "Account created. Check your email to confirm your account.",
  };
}

// Logout 
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
} 

// Password Reset
export async function resetPasswordForEmail(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
} 

// Google Sign In
export async function signInWithGoogle(intent?: AuthIntent): Promise<OAuthAuthResult> {
  const supabase = await createClient({ appendPkceFlowIdToRedirects: true });

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildAuthCallbackUrl(process.env.NEXT_PUBLIC_SITE_URL!, intent),
      }
    });

    if (error) {
      console.error('Google OAuth start failed:', {
        code: error.code ?? null,
        message: error.message,
        status: error.status ?? null,
        name: error.name,
      });
      return {
        success: false,
        error: 'Unable to start Google sign-in. Please try again.',
        errorCode: AUTH_ERROR_CODES.oauthStartFailed,
      };
    }

    if (data?.url) {
      return { success: true, url: data.url };
    }

    console.error('Google OAuth start returned no URL');
    return {
      success: false,
      error: 'Unable to start Google sign-in. Please try again.',
      errorCode: AUTH_ERROR_CODES.oauthStartFailed,
    };
  } catch (error) {
    console.error('Google OAuth start threw:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
    });
    return { 
      success: false, 
      error: 'Unable to start Google sign-in. Please try again.',
      errorCode: AUTH_ERROR_CODES.oauthStartFailed,
    };
  }
} 

// Check if user is authenticated
export async function checkAuth(): Promise<{ 
  authenticated: boolean; 
  user?: { id: string; email?: string } | null 
}> {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Auth check error:', error);
      return { authenticated: false };
    }

    return { 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Unexpected error during auth check:', error);
    return { authenticated: false };
  }
} 

// Get user ID if authenticated
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
} 

// New function to check subscription status
export async function getSubscriptionStatus(): Promise<{
  hasSubscription: boolean;
  plan?: string;
  status?: string;
  error?: string;
}> {
  const supabase = await createClient();
  
  try {
    const userId = await getUserId();
    if (!userId) {
      return { hasSubscription: false, error: 'No authenticated user' };
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('subscription_plan, subscription_status')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { hasSubscription: false, error: error.message };
    }

    return {
      hasSubscription: !!subscription,
      plan: subscription?.subscription_plan,
      status: subscription?.subscription_status
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { 
      hasSubscription: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 

export async function deleteUserAccount(formData: FormData) {
  'use server'
  
  const confirmation = formData.get('confirm')
  if (confirmation !== 'DELETE') {
    throw new Error('Invalid confirmation text')
  }

  try {
    const { supabase: authClient, user } = await getAuthenticatedClient()
    const { supabase: serviceClient } = await getServiceClient()

    // Delete subscription + Stripe customer + subscription record
    await deleteCustomerAndData(user.id)

    // Delete user data from profiles table
    const { error: profileError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('user_id', user.id)
    
    if (profileError) throw new Error(profileError.message)

    // Delete user's resumes
    const { error: resumeError } = await serviceClient
      .from('resumes')
      .delete()
      .eq('user_id', user.id)

    if (resumeError) throw new Error(resumeError.message)

    // Delete user from auth last
    const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (authError) throw new Error(authError.message)

    // Sign out after deletion
    await authClient.auth.signOut()
  } catch (error) {
    console.error('Account deletion failed:', error)
    throw error
  }

  redirect('/')
} 
