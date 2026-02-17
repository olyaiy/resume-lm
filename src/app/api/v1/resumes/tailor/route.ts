import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  apiResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError, NotFoundError, ValidationError } from '@/lib/api-errors';
import {
  getResumeById,
  createTailoredResume,
  generateResumeScore,
} from '@/utils/actions/resumes/actions';
import { tailorResumeToJob } from '@/utils/actions/jobs/ai';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Schema for POST request body
const tailorResumeSchema = z.object({
  base_resume_id: z.string().uuid('Invalid base resume ID'),
  job_id: z.string().uuid('Invalid job ID'),
  config: z
    .object({
      model: z.string().optional(),
      apiKeys: z.array(z.string()).optional(),
      customPrompts: z.any().optional(),
    })
    .optional(),
  generate_score: z.boolean().default(false),
});

/**
 * POST /api/v1/resumes/tailor
 * Create a tailored resume from a base resume for a specific job
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Validate request body
    const validation = await validateRequest(req, tailorResumeSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { base_resume_id, job_id, config, generate_score } = validation.data;

    // Get base resume
    const { resume: baseResume } = await getResumeById(base_resume_id);

    if (!baseResume) {
      throw new NotFoundError('Base resume not found');
    }

    // Verify it's a base resume
    if (!baseResume.is_base_resume) {
      throw new ValidationError(
        'Only base resumes can be used as source for tailoring. Please select a base resume.'
      );
    }

    // Verify ownership
    if (baseResume.user_id !== user.id) {
      throw new NotFoundError('Base resume not found');
    }

    // Get job details
    const supabase = await createClient();
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      throw new NotFoundError('Job not found');
    }

    // Tailor resume content using AI
    const tailoredContent = await tailorResumeToJob(
      baseResume,
      job as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      config as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    // Create the tailored resume in database
    const tailoredResume = await createTailoredResume(
      baseResume,
      job_id,
      job.position_title,
      job.company_name,
      tailoredContent
    );

    // Optionally generate score for the tailored resume
    let score = null;
    if (generate_score) {
      try {
        score = await generateResumeScore(
          tailoredResume,
          job as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          config as any // eslint-disable-line @typescript-eslint/no-explicit-any
        );
      } catch (scoreError) {
        console.error('Failed to generate score for tailored resume:', scoreError);
        // Don't fail the whole request if scoring fails
      }
    }

    return apiResponse(
      {
        resume: tailoredResume,
        ...(score && { score }),
      },
      201
    );
  } catch (error) {
    return handleAPIError(error);
  }
}
