import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authenticateRequest, requireAdmin, apiResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

/**
 * GET /api/v1/profiles/[id]
 * Get any user's profile (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Check admin privileges
    await requireAdmin(user);

    // Get profile ID from params
    const { id } = await params;

    // Get profile from database
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error || !profile) {
      return apiResponse({ error: 'Profile not found' }, 404);
    }

    return apiResponse({ profile });
  } catch (error) {
    return handleAPIError(error);
  }
}
