import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  apiResponse,
  parsePaginationParams,
  createPaginatedResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { createBaseResume } from '@/utils/actions/resumes/actions';
import { z } from 'zod';

// Schema for POST request body
const createResumeSchema = z.object({
  name: z.string().min(1, 'Resume name is required'),
  importOption: z.enum(['import-profile', 'fresh', 'import-resume']).default('import-profile'),
  selectedContent: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().email().optional(),
      phone_number: z.string().optional(),
      location: z.string().optional(),
      website: z.string().optional(),
      linkedin_url: z.string().optional(),
      github_url: z.string().optional(),
      work_experience: z.array(z.any()).default([]),
      education: z.array(z.any()).default([]),
      skills: z.array(z.any()).default([]),
      projects: z.array(z.any()).default([]),
    })
    .optional(),
});

/**
 * GET /api/v1/resumes
 * List resumes with pagination and filtering
 * Query params: type=base|tailored|all, page=1, limit=20
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Parse pagination params
    const pagination = parsePaginationParams(req);

    // Parse query params
    const url = new URL(req.url);
    const typeParam = url.searchParams.get('type') || 'all';
    const type = ['base', 'tailored', 'all'].includes(typeParam) ? typeParam : 'all';

    // Get resumes from database
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('resumes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    // Apply type filter
    if (type === 'base') {
      query = query.eq('is_base_resume', true);
    } else if (type === 'tailored') {
      query = query.eq('is_base_resume', false);
    }

    const { data: resumes, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch resumes: ${error.message}`);
    }

    // Return paginated response
    return createPaginatedResponse(resumes || [], count || 0, pagination);
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * POST /api/v1/resumes
 * Create a new base resume
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    // Validate request body
    const validation = await validateRequest(req, createResumeSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { name, importOption, selectedContent } = validation.data;

    // Create resume using server action
    const resume = await createBaseResume(
      name,
      importOption,
      selectedContent as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    return apiResponse({ resume }, 201);
  } catch (error) {
    return handleAPIError(error);
  }
}
