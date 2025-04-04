'use server';

import { createServiceClient } from "@/utils/supabase/server";

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

export async function getUsersWithProfilesAndSubscriptions() {
  const supabase = await createServiceClient();

  // 1. Get all users first
  const users = await getAllUsers();
  if (!users || users.length === 0) {
    return [];
  }
  const userIds = users.map(user => user.id);

  // 2. Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw new Error('Failed to fetch profiles');
  }
  const profilesMap = new Map(profiles?.map(p => [p.user_id, p]));

  // 3. Fetch subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('*')
    .in('user_id', userIds);
  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError);
    throw new Error('Failed to fetch subscriptions');
  }
  const subscriptionsMap = new Map(subscriptions?.map(s => [s.user_id, s]));

  // 4. Fetch resume counts
  // Using a more efficient approach to count per user_id
  const { data: resumeCountsData, error: resumeCountsError } = await supabase
    .rpc('count_resumes_by_user', { user_ids: userIds }); // Assuming an RPC function 'count_resumes_by_user' exists

  if (resumeCountsError) {
      // Fallback to less efficient client-side grouping if RPC fails or doesn't exist
      console.warn('RPC function count_resumes_by_user failed or not found. Falling back to client-side counting.', resumeCountsError);
      const { data: fallbackData, error: fallbackError } = await supabase
          .from('resumes')
          .select('user_id', { count: 'exact', head: false }) // Select user_id to group by
          .in('user_id', userIds);

      if (fallbackError) {
          console.error('Error fetching resume counts (fallback):', fallbackError);
          throw new Error('Failed to fetch resume counts');
      }
      
      // Process fallback data
      const tempCountsMap = new Map<string, number>();
      fallbackData?.forEach((item: { user_id: string }) => {
          tempCountsMap.set(item.user_id, (tempCountsMap.get(item.user_id) || 0) + 1);
      });
      // Convert Map to the expected array format [{ user_id: string, count: number }]
      // This step is needed if the rest of the code expects the RPC format.
      // If adapting the merge logic is easier, do that instead.
      // For now, we'll proceed assuming the merge logic handles the Map directly later.
      // resumeCountsData = Array.from(tempCountsMap, ([user_id, count]) => ({ user_id, count })); // Example conversion if needed
       
       // Let's adjust the merge logic instead to handle the map directly
       const resumeCountsMap = tempCountsMap;

        // 5. Merge data (using Maps for efficiency)
        const mergedData = users.map(user => {
          const profile = profilesMap.get(user.id) || null;
          const subscription = subscriptionsMap.get(user.id) || null;
          const resume_count = resumeCountsMap.get(user.id) || 0; // Use the map here

          return {
            user,
            profile,
            subscription,
            resume_count // Add resume count here
          };
        });
        return mergedData;

  } else {
      // Process successful RPC data
      const resumeCountsMap = new Map<string, number>(
          resumeCountsData?.map((item: { user_id: string, count: number }) => [item.user_id, item.count]) || []
      );

      // 5. Merge data (using Maps for efficiency)
      const mergedData = users.map(user => {
        const profile = profilesMap.get(user.id) || null;
        const subscription = subscriptionsMap.get(user.id) || null;
        const resume_count = resumeCountsMap.get(user.id) || 0;

        return {
          user,
          profile,
          subscription,
          resume_count // Add resume count here
        };
      });
      return mergedData;
  }
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