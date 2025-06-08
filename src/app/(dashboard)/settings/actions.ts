'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

interface SecurityResult {
  success: boolean;
  error?: string;
}

export async function updateEmail(formData: FormData): Promise<SecurityResult> {
  const supabase = await createClient();
  const newEmail = formData.get('email') as string;
  const currentPassword = formData.get('currentPassword') as string;

  // First verify the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user?.email) {
    return { success: false, error: 'Unable to verify current user' };
  }

  // Don't update if it's the same email
  if (user.email === newEmail) {
    return { success: false, error: 'New email must be different from current email' };
  }

  // Verify current password first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Then update the email
  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<SecurityResult> {
  const supabase = await createClient();
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  // Get the current user's email
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user?.email) {
    return { success: false, error: 'Unable to verify current user' };
  }

  // First verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Then update to the new password
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
} 



interface ApiTestResult {
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export async function testApiKey(): Promise<ApiTestResult> {
    try {
      const supabase = await createClient()
      
      // Get the API key from vault
      const { data: apiKey, error: keyError } = await supabase
        .rpc('get_api_key', {
          p_service_name: 'openai'
        })
  
      if (keyError || !apiKey) {
        return { 
          success: false, 
          error: 'No API key found for OpenAI' 
        }
      }
  
      const openai = new OpenAI({
        apiKey: apiKey.trim(),
      });
  
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: 'user', content: 'Say this is a test!' }],
        response_format: { type: "text" },
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });
  
      return {
        success: true,
        message: response.choices[0]?.message?.content || 'API connection successful'
      }
  
    } catch (error) {
      console.error('Error testing API key:', error)
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test API key'
      }
    }
  }
  
  