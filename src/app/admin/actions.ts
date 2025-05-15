'use server';

import { createClient, createServiceClient } from "@/utils/supabase/server"; // Import createClient as well
import { redirect } from 'next/navigation'; // Import redirect
import { revalidatePath } from 'next/cache';

export async function getAllUsers() {
  const supabase = await createServiceClient();
  const allUsers = [];
  let page = 1;
  const perPage = 1000; // Max allowed by Supabase

  try {
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: perPage,
      });

      if (error) {
        console.error(`Error fetching users (page ${page}):`, error);
        throw new Error(`Failed to fetch users on page ${page}`);
      }

      if (data && data.users) {
        allUsers.push(...data.users);
        // If the number of users fetched is less than perPage, we've reached the last page
        if (data.users.length < perPage) {
          break;
        }
      } else {
        // Should not happen if there's no error, but good to handle
        break;
      }
      
      page++;
    }
  } catch (error) {
    console.error('Error in getAllUsers pagination loop:', error);
    // Re-throw the error after logging
    throw error;
  }

  return allUsers;
}

/**
 * Checks if the currently authenticated user is an admin.
 * Fetches the user ID using the server client and checks the 'admins' table.
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise.
 */
export async function checkAdminStatus(): Promise<boolean> {
  // Use the regular client that can read user session cookies
  const supabase = await createClient();

  // Get the current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Admin Check: Error fetching user or user not authenticated.', authError);
    return false; // Not authenticated, definitely not admin
  }

  // Check the admins table for this user
  const { data: adminData, error: dbError } = await supabase
    .from('admins')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  // Detailed logging for RLS debugging
  if (dbError) {
      console.error(`Admin Check DB Error: Failed to query admins table for user ${user.id}. RLS issue?`, { code: dbError.code, message: dbError.message, details: dbError.details, hint: dbError.hint });
      return false; // Error occurred, assume not admin for safety
  } else {
      console.log(`Admin Check DB Success: Query for user ${user.id} returned:`, adminData);
  }

  // If adminData exists and is_admin is true, return true
  return adminData?.is_admin === true;
}

/**
 * Ensures the current user is an admin, otherwise redirects.
 * Calls checkAdminStatus and redirects to '/' if the user is not an admin.
 */
export async function ensureAdmin() {
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        redirect('/');
    }
    // If isAdmin is true, execution continues normally.
}

// Define interfaces for RPC return types to help with typing
interface Profile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  work_experience?: Array<{
    company?: string;
    title?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    location?: string;
    [key: string]: unknown;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    [key: string]: unknown;
  }>;
  skills?: Array<{
    category?: string;
    items?: string[];
    [key: string]: unknown;
  }>;
  projects?: Array<{
    [key: string]: unknown;
  }>;
  certifications?: Array<{
    [key: string]: unknown;
  }>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface Subscription {
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_plan?: string;
  subscription_status?: string;
  current_period_end?: string;
  trial_end?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  [key: string]: unknown;
}

interface UserWithDetails {
  user: User;
  profile: Profile | null;
  subscription: Subscription | null;
  resume_count: number;
}

export async function getUsersWithProfilesAndSubscriptions(): Promise<UserWithDetails[]> {
  const supabase = await createServiceClient();
  const users = await getAllUsers();
  if (!users || users.length === 0) {
    return [];
  }
  const userIds = users.map(user => user.id);

  console.log(`Fetching profiles, subscriptions, and resume counts for ${userIds.length} users via RPC.`);

  // 1. Fetch profiles using RPC
  const { data: profiles, error: profilesError } = await supabase
    .rpc('get_profiles_for_users', { user_ids_array: userIds });

  if (profilesError) {
    console.error('Error fetching profiles via RPC:', profilesError);
    throw new Error('Failed to fetch profiles');
  }
  const profilesMap = new Map((profiles as Profile[] | null)?.map(p => [p.user_id, p]));

  // 2. Fetch subscriptions using RPC
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .rpc('get_subscriptions_for_users', { user_ids_array: userIds });

  if (subscriptionsError) {
    console.error('Error fetching subscriptions via RPC:', subscriptionsError);
    throw new Error('Failed to fetch subscriptions');
  }
  const subscriptionsMap = new Map((subscriptions as Subscription[] | null)?.map(s => [s.user_id, s]));

  // 3. Fetch resume counts using RPC
  const { data: resumeCountsData, error: resumeCountsError } = await supabase
    .rpc('get_resume_counts_for_users', { user_ids_array: userIds });

  if (resumeCountsError) {
    console.error('Error fetching resume counts via RPC:', resumeCountsError);
    // No fallback here, as the RPC should be reliable. If it fails, it's a deeper issue.
    throw new Error('Failed to fetch resume counts');
  }
  
  const resumeCountsMap = new Map<string, number>(
    resumeCountsData?.map((item: { user_id: string, resume_count: number }) => [item.user_id, Number(item.resume_count) || 0]) || []
);


  // 4. Merge data (using Maps for efficiency)
  const mergedData = users.map(user => {
    const profile = profilesMap.get(user.id) || null;
    const subscription = subscriptionsMap.get(user.id) || null;
    const resume_count = resumeCountsMap.get(user.id) || 0;

    return {
      user,
      profile,
      subscription,
      resume_count
    } as unknown as UserWithDetails;
  });
  return mergedData;
}

export async function getUserDetailsById(userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const supabase = await createServiceClient();

  // 1. Fetch User Auth Info
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError) {
    console.error(`Error fetching user auth info for ${userId}:`, userError);
    // Handle specific errors like user not found gracefully if needed
    if (userError.message.includes('User not found')) {
       return null; // Or throw a specific "NotFound" error
    }
    throw new Error(`Failed to fetch user auth info for ${userId}`);
  }
  const user = userData.user;

  // 2. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle as profile might not exist

  if (profileError) {
    console.error(`Error fetching profile for ${userId}:`, profileError);
    // Decide if this is critical. Maybe return partial data?
    throw new Error(`Failed to fetch profile for ${userId}`);
  }

  // 3. Fetch Subscription
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle as subscription might not exist

  if (subscriptionError) {
    console.error(`Error fetching subscription for ${userId}:`, subscriptionError);
    // Decide if this is critical. Maybe return partial data?
    throw new Error(`Failed to fetch subscription for ${userId}`);
  }

  // 4. Combine and return
  // Ensure user is not null before proceeding
  if (!user) {
      console.warn(`User data was unexpectedly null after fetch for ID: ${userId}`);
      return null; // Or handle as appropriate
  }
  
  return {
    user,
    profile,
    subscription,
  };
}

export async function getResumeCountForUser(userId: string): Promise<number> {
  if (!userId) {
    console.error('Attempted to get resume count without user ID.');
    return 0; // Or throw an error if preferred
  }

  const supabase = await createServiceClient();

  const { count, error } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true }) // Use head: true for count only
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching resume count for user ${userId}:`, error);
    // Decide how to handle error, returning 0 for now
    return 0;
  }

  return count ?? 0;
}

export async function getResumesForUser(userId: string) {
   if (!userId) {
    console.error('Attempted to get resumes without user ID.');
    return []; // Return empty array or throw error
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('resumes')
    .select('id, name, created_at, is_base_resume') // Select only needed fields
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Order by creation date

  if (error) {
    console.error(`Error fetching resumes for user ${userId}:`, error);
    // Decide how to handle error, returning empty array for now
    return [];
  }

  // Ensure data is not null before returning
  return data ?? [];
}

// Action to get the total count of users using the admin API (respects permissions)
export async function getTotalUserCount(): Promise<number> {
  const supabase = await createServiceClient();
  let totalCount = 0;
  let page = 1;
  const perPage = 1000; // Max allowed by Supabase

  try {
    while (true) {
      // Fetch only the minimal data needed for counting, if possible (though listUsers might fetch more)
      // Using { data: { users }, error } structure based on listUsers documentation/typings
      const { data, error } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: perPage,
        // We don't actually need the user objects, but listUsers fetches them.
      });

      if (error) {
        // Handle specific errors like rate limits if necessary
        console.error(`Error fetching users for count (page ${page}):`, error);
        throw new Error(`Failed to fetch users for count on page ${page}`);
      }

      const users = data?.users;

      if (users && users.length > 0) {
        totalCount += users.length;
        // If the number of users fetched is less than perPage, we've reached the last page
        if (users.length < perPage) {
          break;
        }
      } else {
        // No more users or an unexpected response
        break;
      }
      
      page++;
      // Add a safety break for extremely large user bases, though unlikely needed
      if (page > 1000) { // e.g., limit to 1 million users
          console.warn("getTotalUserCount reached maximum page limit (1000). Count might be incomplete.");
          break;
      }
    }
  } catch (error) {
    console.error('Error in getTotalUserCount pagination loop:', error);
    // Depending on requirements, you might return partial count or 0, or re-throw
    return 0; // Return 0 on error for now
    // throw error;
  }

  return totalCount;
}

// Action to get the total count of resumes using RPC
export async function getTotalResumeCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc('count_total_resumes');

  if (error) {
    console.error('Error fetching total resume count:', error);
    // Decide how to handle error, returning 0 for now or throwing
    return 0;
    // throw new Error('Failed to fetch total resume count');
  }

  // Assuming the RPC returns the count directly
  return typeof data === 'number' ? data : 0;
}

// Action to get the total count of subscriptions
export async function getTotalSubscriptionCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { count, error } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    // Add filtering if needed, e.g., filter by active status if there's a 'status' column
    // .eq('status', 'active');

  if (error) {
    console.error('Error fetching total subscription count:', error);
    return 0; // Return 0 on error
  }

  return count ?? 0;
}

// Action to get the total count of base resumes
export async function getBaseResumeCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { count, error } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('is_base_resume', true);

  if (error) {
    console.error('Error fetching base resume count:', error);
    return 0; // Return 0 on error
  }
  
  return count ?? 0;
}

// Action to get the total count of active subscriptions (Pro Users)
export async function getProUserCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { count, error } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    // Check for 'pro' plan and 'active' status
    .eq('subscription_plan', 'pro')
    .eq('subscription_status', 'active');

  if (error) {
    console.error('Error fetching pro user count:', error);
    return 0; // Return 0 on error
  }

  return count ?? 0;
}

// Action to get the total count of tailored resumes
export async function getTailoredResumeCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { count, error } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('is_base_resume', false);

  if (error) {
    console.error('Error fetching tailored resume count:', error);
    return 0; // Return 0 on error
  }

  return count ?? 0;
}

/**
 * Updates a user's subscription plan as an admin.
 * @param userId - The ID of the user whose subscription plan should be updated.
 * @param plan - The new subscription plan ('free' or 'pro').
 * @returns {Promise<{ success: boolean, message: string }>} - Result of the operation.
 */
export async function updateUserSubscriptionPlan(
  userId: string,
  plan: 'free' | 'pro'
): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure the current user is an admin
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      return {
        success: false,
        message: 'Unauthorized: Only administrators can update subscription plans.',
      };
    }

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required.',
      };
    }

    if (plan !== 'free' && plan !== 'pro') {
      return {
        success: false,
        message: 'Invalid plan type. Plan must be "free" or "pro".',
      };
    }

    const supabase = await createServiceClient();

    // Determine subscription status based on plan
    const subscription_status = plan === 'pro' ? 'active' : null;

    // Check if the user already has a subscription record
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking subscription for user ${userId}:`, checkError);
      return {
        success: false,
        message: `Database error: ${checkError.message}`,
      };
    }

    let updateError;

    if (existingSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({
          subscription_plan: plan,
          subscription_status: subscription_status,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      updateError = error;
    } else {
      // Create new subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          subscription_plan: plan,
          subscription_status: subscription_status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      updateError = error;
    }

    if (updateError) {
      console.error(`Error updating subscription for user ${userId}:`, updateError);
      return {
        success: false,
        message: `Failed to update subscription: ${updateError.message}`,
      };
    }

    // Revalidate the user detail page and admin pages to reflect the changes
    revalidatePath(`/admin/${userId}`);
    revalidatePath('/admin');

    return {
      success: true,
      message: `Subscription plan successfully updated to "${plan}".`,
    };
  } catch (error) {
    console.error('Unexpected error updating subscription plan:', error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}