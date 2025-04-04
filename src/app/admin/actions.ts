'use server';

import { createServiceClient } from "@/utils/supabase/server";

export async function getAllUsers() {
  const supabase = await createServiceClient();
  
  // Get all users from auth.users table
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw new Error('Failed to fetch users');
  }
  
  return users.users;
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