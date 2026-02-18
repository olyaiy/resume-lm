import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  apiResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError, NotFoundError } from '@/lib/api-errors';
import { getResumeById, updateResume } from '@/utils/actions/resumes/actions';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Job } from '@/lib/types';
import { generateObject, ToolInvocation } from 'ai';
import { initializeAIClient } from '@/utils/ai-tools';
import { simplifiedResumeSchema } from '@/lib/zod-schemas';
import { getSubscriptionPlan } from '@/utils/actions/stripe/actions';

// Schema for POST request body
const optimizeChatSchema = z.object({
  resume_id: z.string().uuid('Invalid resume ID'),
  message: z.string().min(1, 'Message is required'),
  job_id: z.string().uuid('Invalid job ID').optional(),
  config: z
    .object({
      model: z.string().optional(),
      apiKeys: z.array(z.string()).optional(),
      customPrompts: z.any().optional(),
    })
    .optional(),
});

/**
 * POST /api/v1/optimize/chat
 * Interactive optimization endpoint - single AI message with resume updates
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Validate request body
    const validation = await validateRequest(req, optimizeChatSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { resume_id, message, job_id, config } = validation.data;

    // Get resume
    const { resume } = await getResumeById(resume_id);

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Verify ownership
    if (resume.user_id !== user.id) {
      throw new NotFoundError('Resume not found');
    }

    // Get job if provided
    let job: Job | null = null;
    if (job_id) {
      const supabase = await createClient();
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job_id)
        .eq('user_id', user.id)
        .single();

      if (jobError || !jobData) {
        throw new NotFoundError('Job not found');
      }

      job = jobData;
    }

    console.log(`[OPTIMIZE_CHAT] Processing message for resume ${resume_id}`);

    // Get subscription plan
    const { plan } = await getSubscriptionPlan(true);
    const isPro = plan === 'pro';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiClient = isPro ? initializeAIClient(config as any, isPro) : initializeAIClient(config as any);

    // Build context for AI
    const resumeContext = `
CURRENT RESUME:
Name: ${resume.first_name} ${resume.last_name}
Target Role: ${resume.target_role}
Email: ${resume.email}
Phone: ${resume.phone_number || 'N/A'}
Location: ${resume.location || 'N/A'}

Work Experience: ${resume.work_experience?.length || 0} entries
Education: ${resume.education?.length || 0} entries
Skills: ${resume.skills?.length || 0} categories
Projects: ${resume.projects?.length || 0} entries

Full Resume Data:
${JSON.stringify(resume, null, 2)}
`;

    const jobContext = job
      ? `
JOB POSTING:
Position: ${job.position_title}
Company: ${job.company_name}
Location: ${job.location || 'N/A'}
Description: ${job.description || 'N/A'}
Keywords: ${job.keywords?.join(', ') || 'N/A'}
`
      : '';

    const systemPrompt = `You are an expert resume optimization assistant.

${resumeContext}

${jobContext}

The user has asked: "${message}"

Your task:
1. Analyze the user's request in the context of the resume${job ? ' and job posting' : ''}
2. Determine what changes should be made to the resume
3. Generate an optimized version of the resume that addresses the user's request
4. List the specific changes you made

Guidelines:
- Make changes that align with the user's request
- Maintain factual accuracy - do not fabricate experience
- Use strong action verbs and quantify achievements when possible
- If the user asks about the job, tailor changes to better match the job requirements
- Keep resume content professional and ATS-friendly
- Remove any STAR labels or annotations from output

Return the optimized resume and a description of changes made.
`;

    // Generate optimized resume based on user message
    const { object: result } = await generateObject({
      model: aiClient,
      schema: z.object({
        optimized_resume: simplifiedResumeSchema,
        ai_response: z.string().describe('A friendly response explaining what changes were made'),
        changes_applied: z.array(z.string()).describe('List of specific changes made to the resume'),
      }),
      prompt: systemPrompt,
      temperature: 0.6,
    });

    console.log(`[OPTIMIZE_CHAT] AI response generated. Changes: ${result.changes_applied.length}`);

    // Apply changes to resume if any were made
    let updatedResume = resume;
    if (result.changes_applied.length > 0) {
      console.log(`[OPTIMIZE_CHAT] Applying ${result.changes_applied.length} changes to resume`);
      updatedResume = await updateResume(resume_id, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(result.optimized_resume as any),
        updated_at: new Date().toISOString(),
      });
    }

    // Format changes as tool invocations for consistent response structure
    const toolInvocations: ToolInvocation[] = result.changes_applied.map((change, index) => ({
      toolCallId: `change-${index}`,
      toolName: 'update_resume',
      args: { description: change },
      state: 'result' as const,
      result: { success: true, change },
    }));

    return apiResponse(
      {
        resume: updatedResume,
        message: result.ai_response,
        changes_applied: toolInvocations,
      },
      200
    );
  } catch (error) {
    console.error('[OPTIMIZE_CHAT] Error:', error);
    return handleAPIError(error);
  }
}
