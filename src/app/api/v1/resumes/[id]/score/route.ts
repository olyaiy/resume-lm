import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  apiResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError, NotFoundError } from '@/lib/api-errors';
import { getResumeById, generateResumeScore } from '@/utils/actions/resumes/actions';
import { z } from 'zod';

// Schema for POST request body
const scoreResumeSchema = z.object({
  config: z
    .object({
      model: z.string().optional(),
      apiKeys: z.array(z.string()).optional(),
      customPrompts: z.any().optional(),
    })
    .optional(),
});

/**
 * POST /api/v1/resumes/[id]/score
 * Generate AI score for a resume
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    const { id } = await params;

    // Validate request body (optional config)
    const validation = await validateRequest(req, scoreResumeSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { config } = validation.data;

    // Get resume with associated job if tailored
    const { resume, job } = await getResumeById(id);

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Verify ownership (already checked by getResumeById but being explicit)
    if (resume.user_id !== user.id) {
      throw new NotFoundError('Resume not found');
    }

    // Generate score using server action
    const scoreResult = await generateResumeScore(
      resume,
      job as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      config as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    return apiResponse(scoreResult);
  } catch (error) {
    return handleAPIError(error);
  }
}
