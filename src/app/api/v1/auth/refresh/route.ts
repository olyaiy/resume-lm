import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateRequest, apiResponse, apiError, hasValidationData } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';
import { z } from 'zod';

// Schema for refresh token request
const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(req, refreshTokenSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { refresh_token } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Refresh session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return apiError(error.message, 401);
    }

    if (!data.session) {
      return apiError('Failed to refresh session', 401);
    }

    // Return new tokens
    return apiResponse({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
      } : undefined,
    }, 200);
  } catch (error) {
    return handleAPIError(error);
  }
}
