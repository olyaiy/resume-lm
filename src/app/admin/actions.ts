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
  
  // Get all users first
  const users = await getAllUsers();
  
  // Get profiles and subscriptions for all users
  const userIds = users.map(user => user.id);
  
  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw new Error('Failed to fetch profiles');
  }
  
  // Fetch subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('*')
    .in('user_id', userIds);
    
  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError);
    throw new Error('Failed to fetch subscriptions');
  }
  
  // Merge data
  const mergedData = users.map(user => {
    const profile = profiles?.find(p => p.user_id === user.id) || null;
    const subscription = subscriptions?.find(s => s.user_id === user.id) || null;
    
    return {
      user,
      profile,
      subscription
    };
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