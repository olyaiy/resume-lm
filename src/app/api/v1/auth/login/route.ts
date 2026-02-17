import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateRequest, apiResponse, apiError, hasValidationData } from '@/lib/api-utils';
import { loginRequestSchema } from '@/lib/api-schemas';
import { handleAPIError } from '@/lib/api-errors';

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(req, loginRequestSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { email, password } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return apiError(error.message, 401);
    }

    if (!data.user || !data.session) {
      return apiError('Authentication failed', 401);
    }

    // Return user data and tokens
    return apiResponse({
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    }, 200);
  } catch (error) {
    return handleAPIError(error);
  }
}
