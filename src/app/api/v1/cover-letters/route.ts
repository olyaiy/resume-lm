import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authenticateRequest, apiResponse, validateRequest, hasValidationData } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';
import { generate } from '@/utils/actions/cover-letter/actions';
import { generateCoverLetterRequestSchema } from '@/lib/api-schemas';

/**
 * POST /api/v1/cover-letters
 * Generate cover letter (non-streaming)
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Validate request body
    const validation = await validateRequest(req, generateCoverLetterRequestSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { resume_id, job_id, tone = 'professional', length = 'medium' } = validation.data;

    // Get resume and job from database
    const supabase = await createClient();

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      return apiResponse({ error: 'Resume not found' }, 404);
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return apiResponse({ error: 'Job not found' }, 404);
    }

    // Build prompt for cover letter generation
    const prompt = `Write a ${tone} cover letter for the following job using my resume information:

Job Information:
${JSON.stringify(job)}

Resume Information:
${JSON.stringify(resume)}

Today's date is ${new Date().toLocaleDateString()}.

Please use my contact information in the letter:
Full Name: ${resume.first_name} ${resume.last_name}
Email: ${resume.email}
${resume.phone_number ? `Phone: ${resume.phone_number}` : ''}
${resume.linkedin_url ? `LinkedIn: ${resume.linkedin_url}` : ''}
${resume.github_url ? `GitHub: ${resume.github_url}` : ''}

Length: ${length}
Tone: ${tone}`;

    // Generate cover letter (returns streamable value)
    const { output } = await generate(prompt);

    // Note: In a streaming context, output would be consumed by client.
    // For API endpoint, return the streamable value wrapper
    return apiResponse({
      cover_letter: output,
      metadata: {
        resume_id,
        job_id,
        tone,
        length,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
