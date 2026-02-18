import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authenticateRequest, apiResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

/**
 * GET /api/v1/auth/me
 * Get current authenticated user's profile and subscription
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request - will throw if not authenticated
    const user = await authenticateRequest(req);

    // Create Supabase client
    const supabase = await createClient();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - profile might not exist yet
      return handleAPIError(profileError);
    }

    // Fetch user subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('subscription_plan, subscription_status, current_period_end, trial_end')
      .eq('user_id', user.id)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - subscription might not exist yet
      return handleAPIError(subscriptionError);
    }

    return apiResponse({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
      },
      profile: profile || null,
      subscription: subscription || {
        subscription_plan: 'free',
        subscription_status: null,
        current_period_end: null,
        trial_end: null,
      },
    }, 200);
  } catch (error) {
    return handleAPIError(error);
  }
}
