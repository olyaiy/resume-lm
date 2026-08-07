'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, ResumeSummary } from "@/lib/types";
import { getSubscriptionAccessState } from "@/lib/subscription-access";
import { cache } from "react";

interface DashboardData {
  profile: Profile | null;
  baseResumes: ResumeSummary[];
  tailoredResumes: ResumeSummary[];
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    trialEnd: string;
    isTrialing: boolean;
    hasProAccess: boolean;
  };
}

const FALLBACK_SUBSCRIPTION: DashboardData["subscription"] = {
  plan: "",
  status: "",
  currentPeriodEnd: "",
  trialEnd: "",
  isTrialing: false,
  hasProAccess: false,
};

// React request memoization lets the dashboard layout and page share the
// authenticated user and subscription reads instead of repeating them in a
// single server render.
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
});

export const getDashboardSubscription = cache(async (userId: string) => {
  const supabase = await createClient();
  return supabase
    .from('subscriptions')
    .select('subscription_plan, subscription_status, stripe_subscription_id, current_period_end, trial_end')
    .eq('user_id', userId)
    .maybeSingle();
});

export async function getDashboardData(): Promise<DashboardData> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  try {
    // These reads are independent. Running them together removes a full
    // database round-trip from the dashboard critical path.
    const [profileResult, resumesResult, subscriptionResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('resumes')
        .select('id, user_id, name, target_role, is_base_resume, job_id, created_at, updated_at')
        .eq('user_id', user.id),
      getDashboardSubscription(user.id),
    ]);

    const { data, error: profileError } = profileResult;
    let profile = data;

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

    // The resumes request was started in parallel with the profile request.
    const { data: resumes, error: resumesError } = resumesResult;
    if (resumesError) {
      console.error('Error fetching resumes:', resumesError);
      throw new Error('Error fetching dashboard data');
    }

    const sanitizedResumes =
      resumes?.map((resume) => ({
        ...resume,
        target_role: resume.target_role || '',
      })) ?? [];

    const baseResumes = sanitizedResumes.filter((resume) => resume.is_base_resume);
    const tailoredResumes = sanitizedResumes.filter((resume) => !resume.is_base_resume);

    const subscriptionState = getSubscriptionAccessState(subscriptionResult.data);
    const subscription = subscriptionResult.error
      ? FALLBACK_SUBSCRIPTION
      : {
          plan: subscriptionState.effectivePlan,
          status: subscriptionResult.data?.subscription_status ?? '',
          currentPeriodEnd: subscriptionResult.data?.current_period_end ?? '',
          trialEnd: subscriptionResult.data?.trial_end ?? '',
          isTrialing: subscriptionState.isTrialing,
          hasProAccess: subscriptionState.hasProAccess,
        };

    return {
      profile,
      baseResumes,
      tailoredResumes,
      subscription,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'User not authenticated') {
      return {
        profile: null,
        baseResumes: [],
        tailoredResumes: [],
        subscription: FALLBACK_SUBSCRIPTION,
      };
    }
    throw error;
  }
}

