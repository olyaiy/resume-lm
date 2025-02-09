'use server'

import { createClient, createServiceClient } from "@/utils/supabase/server";
import { Profile, Resume } from "@/lib/types";
import { revalidatePath } from 'next/cache';

interface DashboardData {
  profile: Profile | null;
  baseResumes: Resume[];
  tailoredResumes: Resume[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  try {
    // Fetch profile data
    let profile;
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    profile = data;

    // If profile doesn't exist, create one
    if (profileError?.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          first_name: null,
          last_name: null,
          email: user.email,
          phone_number: null,
          location: null,
          website: null,
          linkedin_url: null,
          github_url: null,
          work_experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: []
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw new Error('Error creating user profile');
      }

      profile = newProfile;
    } else if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Error fetching dashboard data');
    }

    // Fetch resumes data
    const { data: resumes, error: resumesError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id);

    if (resumesError) {
      console.error('Error fetching resumes:', resumesError);
      throw new Error('Error fetching dashboard data');
    }

    const baseResumes = resumes?.filter(resume => resume.is_base_resume) ?? [];
    const tailoredResumes = resumes?.filter(resume => !resume.is_base_resume) ?? [];

    const baseResumesData = baseResumes.map(resume => ({
      ...resume,
      type: 'base' as const
    }));

    const tailoredResumesData = tailoredResumes.map(resume => ({
      ...resume,
      type: 'tailored' as const
    }));

    return {
      profile,
      baseResumes: baseResumesData,
      tailoredResumes: tailoredResumesData
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'User not authenticated') {
      return {
        profile: null,
        baseResumes: [],
        tailoredResumes: []
      };
    }
    throw error;
  }
}

export async function getSubscriptionStatus() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`
      subscription_plan,
      subscription_status,
      current_period_end,
      trial_end,
      stripe_customer_id,
      stripe_subscription_id
    `)
    .eq('user_id', user.id)
    .single();

  if (subscriptionError) {
    // If no subscription found, return a default free plan instead of throwing
    void subscriptionError
    if (subscriptionError.code === 'PGRST116') {
      return {
        subscription_plan: 'Free',
        subscription_status: 'active',
        current_period_end: null,
        trial_end: null,
        stripe_customer_id: null,
        stripe_subscription_id: null
      };
    }
    throw new Error('Failed to fetch subscription status');
  }

  return subscription;
}

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      userId: user.id,
      email: user.email,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return { sessionId };
}

export async function cancelSubscription() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  // Update the profile subscription status
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
    })
    .eq('user_id', user.id);

  if (updateError) {
    throw new Error('Failed to update subscription status');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/settings', 'layout');
  revalidatePath('/plans', 'layout');
}

export async function checkSubscriptionPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { plan: '', status: '', currentPeriodEnd: '' };

  const { data } = await supabase
    .from('subscriptions')
    .select('subscription_plan, subscription_status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    plan: data?.subscription_plan || '',
    status: data?.subscription_status || '',
    currentPeriodEnd: data?.current_period_end || ''
  };
}

export async function getSubscriptionPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return '';

  const { data } = await supabase
    .from('subscriptions')
    .select('subscription_plan')
    .eq('user_id', user.id)
    .maybeSingle();

  return data?.subscription_plan || '';
}

export async function toggleSubscriptionPlan(newPlan: 'free' | 'pro'): Promise<'free' | 'pro'> {
  
  const supabase = await createServiceClient();
  


  try {

    // Upsert the new plan
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: "db2686c0-2003-4c90-87b0-cbc20e9d6b3c",
        subscription_plan: newPlan,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      throw new Error('Failed to update subscription');
    }

    revalidatePath('/');
    return newPlan;
  } catch (error) {
    console.error('Subscription toggle error:', error);
    throw new Error('Failed to toggle subscription plan');
  }
}


