import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "../../supabase/server";

// Shared Supabase client initialization
export async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return { supabase, user };
}

export async function getServiceClient() {
  const supabase = await createServiceClient();
  return { supabase };
} 