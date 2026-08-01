'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { MODEL_DESIGNATIONS } from '@/lib/ai-models';
import { createAIClientFromResolvedRequest } from '@/utils/ai-tools';
import { assertProviderCircuitClosed } from '@/lib/ai/reliability';

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
      
      // Get the OpenRouter API key from the server-side vault. The old
      // implementation queried OpenAI and sent an OpenRouter model ID to the
      // direct OpenAI SDK, which created legacy traffic and guaranteed failure.
      const { data: apiKey, error: keyError } = await supabase
        .rpc('get_api_key', {
          p_service_name: 'openrouter'
        })
  
      if (keyError || !apiKey?.trim()) {
        return { 
          success: false, 
          error: 'No API key found for OpenRouter'
        }
      }

      const normalizedApiKey = apiKey.trim();
      await assertProviderCircuitClosed({
        providerId: 'openrouter',
        modelId: MODEL_DESIGNATIONS.FAST_CHEAP_FREE,
        apiKey: normalizedApiKey,
        usedServerKey: false,
      });

      const model = createAIClientFromResolvedRequest({
        providerId: 'openrouter',
        modelId: MODEL_DESIGNATIONS.FAST_CHEAP_FREE,
        apiKey: normalizedApiKey,
        usedServerKey: false,
        requiresRateLimit: false,
      });

      const response = await generateText({
        model,
        prompt: 'Say this is a test!',
        maxRetries: 0,
      });
  
      return {
        success: true,
        message: response.text || 'API connection successful'
      }
  
    } catch (error) {
      console.error('Error testing API key:', error)
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test API key'
      }
    }
  }
