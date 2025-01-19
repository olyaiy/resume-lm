import { createClient } from "@/utils/supabase/server";
import { cache } from 'react';

// Cache the auth check using React cache()
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user;
});

// Helper to get user ID with error handling
export const getUserId = cache(async () => {
  const user = await getAuthenticatedUser();
  return user.id;
}); 