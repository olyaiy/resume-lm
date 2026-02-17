import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authenticateRequest, apiResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

/**
 * POST /api/v1/auth/logout
 * Sign out authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request - will throw if not authenticated
    await authenticateRequest(req);

    // Create Supabase client
    const supabase = await createClient();

    // Sign out user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return handleAPIError(error);
    }

    return apiResponse({
      success: true,
      message: 'Successfully logged out',
    }, 200);
  } catch (error) {
    return handleAPIError(error);
  }
}
