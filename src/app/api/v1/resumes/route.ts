import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  getAuthenticatedServiceClient,
  apiResponse,
  parsePaginationParams,
  createPaginatedResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Resume, WorkExperience, Education, Skill, Project } from '@/lib/types';

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
    // Authenticate request and get service role client
    const { user, supabase } = await getAuthenticatedServiceClient(req);

    // Validate request body
    const validation = await validateRequest(req, createResumeSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { name, importOption, selectedContent } = validation.data;

    // Quota check is bypassed as per the server action
    // await assertResumeQuota(supabase, user.id, 'base');

    // Fetch profile if needed
    // SECURITY: Filter by user_id to prevent unauthorized access
    let profile = null;
    if (importOption !== 'fresh') {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }
      profile = data;
    }

    // Build new resume object
    // SECURITY: user_id is explicitly set to authenticated user
    const newResume: Partial<Resume> = {
      user_id: user.id,
      name,
      target_role: name,
      is_base_resume: true,
      first_name: importOption === 'import-resume' ? selectedContent?.first_name || '' : importOption === 'fresh' ? '' : profile?.first_name || '',
      last_name: importOption === 'import-resume' ? selectedContent?.last_name || '' : importOption === 'fresh' ? '' : profile?.last_name || '',
      email: importOption === 'import-resume' ? selectedContent?.email || '' : importOption === 'fresh' ? '' : profile?.email || '',
      phone_number: importOption === 'import-resume' ? selectedContent?.phone_number || '' : importOption === 'fresh' ? '' : profile?.phone_number || '',
      location: importOption === 'import-resume' ? selectedContent?.location || '' : importOption === 'fresh' ? '' : profile?.location || '',
      website: importOption === 'import-resume' ? selectedContent?.website || '' : importOption === 'fresh' ? '' : profile?.website || '',
      linkedin_url: importOption === 'import-resume' ? selectedContent?.linkedin_url || '' : importOption === 'fresh' ? '' : profile?.linkedin_url || '',
      github_url: importOption === 'import-resume' ? selectedContent?.github_url || '' : importOption === 'fresh' ? '' : profile?.github_url || '',
      work_experience: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
        ? selectedContent.work_experience
        : [],
      education: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
        ? selectedContent.education
        : [],
      skills: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
        ? selectedContent.skills
        : [],
      projects: (importOption === 'import-profile' || importOption === 'import-resume') && selectedContent
        ? selectedContent.projects
        : [],
      section_order: [
        'work_experience',
        'education',
        'skills',
        'projects',
      ],
      section_configs: {
        work_experience: { visible: (selectedContent?.work_experience?.length ?? 0) > 0 },
        education: { visible: (selectedContent?.education?.length ?? 0) > 0 },
        skills: { visible: (selectedContent?.skills?.length ?? 0) > 0 },
        projects: { visible: (selectedContent?.projects?.length ?? 0) > 0 },
      },
      document_settings: {
        footer_width: 0,
        show_ubc_footer: false,
        header_name_size: 24,
        skills_margin_top: 0,
        document_font_size: 10,
        projects_margin_top: 0,
        skills_item_spacing: 0,
        document_line_height: 1.2,
        education_margin_top: 0,
        skills_margin_bottom: 2,
        experience_margin_top: 2,
        projects_item_spacing: 0,
        education_item_spacing: 0,
        projects_margin_bottom: 0,
        education_margin_bottom: 0,
        experience_item_spacing: 1,
        document_margin_vertical: 20,
        experience_margin_bottom: 0,
        skills_margin_horizontal: 0,
        document_margin_horizontal: 28,
        header_name_bottom_spacing: 16,
        projects_margin_horizontal: 0,
        education_margin_horizontal: 0,
        experience_margin_horizontal: 0
      }
    };

    // Insert resume into database
    const { data: resume, error: createError } = await supabase
      .from('resumes')
      .insert([newResume])
      .select()
      .single();

    if (createError) {
      console.error('[POST /api/v1/resumes] Database Insert Error:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });
      throw new Error(`Failed to create resume: ${createError.message}`);
    }

    if (!resume) {
      console.error('[POST /api/v1/resumes] No resume data returned after insert');
      throw new Error('Resume creation failed: No data returned');
    }

    return apiResponse({ resume }, 201);
  } catch (error) {
    return handleAPIError(error);
  }
}
