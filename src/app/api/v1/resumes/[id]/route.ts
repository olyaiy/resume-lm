import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  apiResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError, NotFoundError } from '@/lib/api-errors';
import {
  getResumeById,
  updateResume,
  deleteResume,
} from '@/utils/actions/resumes/actions';
import { z } from 'zod';

// Schema for PATCH request body
const updateResumeSchema = z.object({
  name: z.string().min(1).optional(),
  target_role: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  work_experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  skills: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  section_order: z.array(z.string()).optional(),
  section_configs: z.record(z.object({ visible: z.boolean() })).optional(),
  document_settings: z.any().optional(),
});

/**
 * GET /api/v1/resumes/[id]
 * Get resume by ID with associated profile and job
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    const { id } = await params;

    // Get resume using server action
    const result = await getResumeById(id);

    if (!result.resume) {
      throw new NotFoundError('Resume not found');
    }

    return apiResponse(result);
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/v1/resumes/[id]
 * Update resume by ID
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    const { id } = await params;

    // Validate request body
    const validation = await validateRequest(req, updateResumeSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    // Update resume using server action
    const resume = await updateResume(id, validation.data);

    return apiResponse({ resume });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/v1/resumes/[id]
 * Delete resume by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    const { id } = await params;

    // Delete resume using server action
    await deleteResume(id);

    return apiResponse({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
