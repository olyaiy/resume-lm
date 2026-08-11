'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, ResumeSummary } from "@/lib/types";
import { getSubscriptionAccessState } from "@/lib/subscription-access";
import { cache } from "react";

export interface DashboardData {
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
    .select('subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end, trial_end, payment_failure_count, last_payment_failed_at, next_payment_attempt_at')
    .eq('user_id', userId)
    .maybeSingle();
});

// Keep profile reads request-scoped and share them between route loaders.
// This deliberately uses a projection because profile rows contain large JSON
// arrays that should not be fetched by routes that only need identity data.
export const getProfileForUser = cache(async (userId: string) => {
  const supabase = await createClient();
  return supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, phone_number, location, website, linkedin_url, github_url, work_experience, education, skills, projects, certifications, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
});

export async function getProfilePageData() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data, error } = await getProfileForUser(user.id);
  if (error) {
    throw new Error('Error fetching profile data');
  }

  const profile = data ? ({ ...data, id: data.user_id } as Profile) : null;
  return { user, profile };
}

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
      getProfileForUser(user.id),
      supabase
        .from('resumes')
        .select('id, user_id, name, target_role, is_base_resume, job_id, created_at, updated_at')
        .eq('user_id', user.id),
      getDashboardSubscription(user.id),
    ]);

    const { data, error: profileError } = profileResult;
    let profile: Profile | null = data
      ? ({ ...data, id: data.user_id } as Profile)
      : null;

    // If profile doesn't exist, create one
    if (!profile && !profileError) {
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

      profile = newProfile
        ? ({ ...newProfile, id: newProfile.user_id } as Profile)
        : null;
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

export interface ResumePageData {
  resumes: ResumeSummary[];
  totalCount: number;
}

const RESUME_SORT_COLUMNS = {
  name: "name",
  jobTitle: "target_role",
  createdAt: "created_at",
} as const;

export async function getResumesPageData({
  page,
  pageSize,
  sort,
  direction,
}: {
  page: number;
  pageSize: number;
  sort: keyof typeof RESUME_SORT_COLUMNS;
  direction: "asc" | "desc";
}): Promise<ResumePageData> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("resumes")
    .select('id, user_id, name, target_role, is_base_resume, job_id, created_at, updated_at', { count: "exact" })
    .eq("user_id", user.id)
    .order(RESUME_SORT_COLUMNS[sort], {
      ascending: direction === "asc",
      nullsFirst: false,
    })
    .range(from, to);

  if (error) {
    throw new Error("Error fetching resumes");
  }

  return {
    resumes: (data ?? []).map((resume) => ({
      ...resume,
      target_role: resume.target_role || "",
    })),
    totalCount: count ?? 0,
  };
}
