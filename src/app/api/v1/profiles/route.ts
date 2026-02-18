import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authenticateRequest, apiResponse, validateRequest, hasValidationData } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';
import { updateProfile } from '@/utils/actions/profiles/actions';
import { z } from 'zod';

/**
 * GET /api/v1/profiles
 * Get current user's profile
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Get user's profile from database
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !profile) {
      return apiResponse({ error: 'Profile not found' }, 404);
    }

    return apiResponse({ profile });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/v1/profiles
 * Update current user's profile
 */
export async function PATCH(req: NextRequest) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    // Define validation schema for profile updates
    const updateProfileSchema = z.object({
      first_name: z.string().optional().nullable(),
      last_name: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone_number: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      website: z.string().url().optional().nullable(),
      linkedin_url: z.string().url().optional().nullable(),
      github_url: z.string().url().optional().nullable(),
      work_experience: z.array(z.any()).optional(),
      education: z.array(z.any()).optional(),
      skills: z.array(z.any()).optional(),
      projects: z.array(z.any()).optional(),
    });

    // Validate request body
    const validation = await validateRequest(req, updateProfileSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    // Update profile using server action
    const updatedProfile = await updateProfile(validation.data);

    return apiResponse({ profile: updatedProfile });
  } catch (error) {
    return handleAPIError(error);
  }
}
