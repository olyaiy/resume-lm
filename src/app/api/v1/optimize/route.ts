import { NextRequest } from 'next/server';
import {
  getAuthenticatedServiceClient,
  apiResponse,
  validateRequest,
  hasValidationData,
} from '@/lib/api-utils';
import { handleAPIError, NotFoundError } from '@/lib/api-errors';
import { generateResumeScore } from '@/utils/actions/resumes/actions';
import { tailorResumeToJob } from '@/utils/actions/jobs/ai';
import { z } from 'zod';
import type { Job, Resume } from '@/lib/types';
import type { ResumeScoreMetrics } from '@/lib/zod-schemas';
import { generateObject } from 'ai';
import { initializeAIClient } from '@/utils/ai-tools';
import { simplifiedResumeSchema } from '@/lib/zod-schemas';
import { getSubscriptionPlan } from '@/utils/actions/stripe/actions';

// Schema for POST request body
const optimizeResumeSchema = z.object({
  base_resume_id: z.string().uuid('Invalid base resume ID'),
  job_id: z.string().uuid('Invalid job ID'),
  target_score: z.number().min(0).max(100).default(85),
  max_iterations: z.number().int().min(1).max(10).default(5),
  config: z
    .object({
      model: z.string().optional(),
      apiKeys: z.array(z.string()).optional(),
      customPrompts: z.any().optional(),
    })
    .optional(),
});

interface OptimizationHistory {
  iteration: number;
  score: number;
  changes: string[];
  timestamp: string;
}

/**
 * Generate optimization prompt based on score analysis
 */
function generateOptimizationPrompt(
  scoreResult: ResumeScoreMetrics,
  resume: Resume,
  job: Job
): string {
  const weakAreas: string[] = [];
  const suggestions: string[] = [];

  // Analyze completeness
  if (scoreResult.completeness.contactInformation.score < 80) {
    weakAreas.push('Contact Information');
    suggestions.push(scoreResult.completeness.contactInformation.reason);
  }
  if (scoreResult.completeness.detailLevel.score < 80) {
    weakAreas.push('Detail Level');
    suggestions.push(scoreResult.completeness.detailLevel.reason);
  }

  // Analyze impact score
  if (scoreResult.impactScore.activeVoiceUsage.score < 80) {
    weakAreas.push('Active Voice Usage');
    suggestions.push(scoreResult.impactScore.activeVoiceUsage.reason);
  }
  if (scoreResult.impactScore.quantifiedAchievements.score < 80) {
    weakAreas.push('Quantified Achievements');
    suggestions.push(scoreResult.impactScore.quantifiedAchievements.reason);
  }

  // Analyze role match
  if (scoreResult.roleMatch.skillsRelevance.score < 80) {
    weakAreas.push('Skills Relevance');
    suggestions.push(scoreResult.roleMatch.skillsRelevance.reason);
  }
  if (scoreResult.roleMatch.experienceAlignment.score < 80) {
    weakAreas.push('Experience Alignment');
    suggestions.push(scoreResult.roleMatch.experienceAlignment.reason);
  }
  if (scoreResult.roleMatch.educationFit.score < 80) {
    weakAreas.push('Education Fit');
    suggestions.push(scoreResult.roleMatch.educationFit.reason);
  }

  // Analyze job alignment for tailored resumes
  if (scoreResult.jobAlignment) {
    if (scoreResult.jobAlignment.keywordMatch.score < 80) {
      weakAreas.push('Keyword Match');
      suggestions.push(scoreResult.jobAlignment.keywordMatch.reason);
      if (scoreResult.jobAlignment.keywordMatch.missingKeywords?.length) {
        suggestions.push(
          `Missing keywords: ${scoreResult.jobAlignment.keywordMatch.missingKeywords.join(', ')}`
        );
      }
    }
    if (scoreResult.jobAlignment.requirementsMatch.score < 80) {
      weakAreas.push('Requirements Match');
      suggestions.push(scoreResult.jobAlignment.requirementsMatch.reason);
      if (scoreResult.jobAlignment.requirementsMatch.gapAnalysis?.length) {
        suggestions.push(
          `Gaps: ${scoreResult.jobAlignment.requirementsMatch.gapAnalysis.join(', ')}`
        );
      }
    }
    if (scoreResult.jobAlignment.companyFit.score < 80) {
      weakAreas.push('Company Fit');
      suggestions.push(scoreResult.jobAlignment.companyFit.reason);
    }
  }

  // Include overall improvements
  if (scoreResult.overallImprovements?.length) {
    suggestions.push(...scoreResult.overallImprovements);
  }

  // Include job-specific improvements
  if (scoreResult.jobSpecificImprovements?.length) {
    suggestions.push(...scoreResult.jobSpecificImprovements);
  }

  const prompt = `
You are an expert resume optimizer. Optimize this resume to better align with the job description.

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(job, null, 2)}

CURRENT SCORE: ${scoreResult.overallScore.score}/100

WEAK AREAS REQUIRING IMPROVEMENT (score < 80):
${weakAreas.length > 0 ? weakAreas.map((area, i) => `${i + 1}. ${area}`).join('\n') : 'None identified'}

SPECIFIC IMPROVEMENT SUGGESTIONS:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OPTIMIZATION INSTRUCTIONS:
1. Focus ONLY on the weak areas listed above
2. Incorporate missing keywords naturally into work experience bullets
3. Quantify achievements with specific metrics where possible
4. Use strong action verbs and active voice
5. Ensure all content is truthful and based on existing resume data
6. DO NOT fabricate experience or skills
7. Maintain chronological accuracy
8. Keep bullets concise (1-2 lines max)
9. Remove any STAR labels or annotations from the output

Return the optimized resume that addresses these specific weak areas while maintaining factual accuracy.
`;

  return prompt;
}

/**
 * POST /api/v1/optimize
 * Main optimization workflow endpoint - automated iterative resume optimization
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request and get service role client
    const { user, supabase } = await getAuthenticatedServiceClient(req);

    // Validate request body
    const validation = await validateRequest(req, optimizeResumeSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const { base_resume_id, job_id, config } = validation.data;
    const target_score = validation.data.target_score ?? 85;
    const max_iterations = validation.data.max_iterations ?? 5;

    // Get base resume directly from DB
    // SECURITY: Filter by user_id to prevent unauthorized access
    const { data: baseResume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', base_resume_id)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !baseResume) {
      throw new NotFoundError('Base resume not found');
    }

    // Verify it's a base resume
    if (!baseResume.is_base_resume) {
      throw new NotFoundError('Only base resumes can be optimized. Please select a base resume.');
    }

    // Get job details directly from DB
    // SECURITY: Filter by user_id to prevent unauthorized access
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      throw new NotFoundError('Job not found');
    }

    console.log(`[OPTIMIZE] Starting optimization workflow for resume ${base_resume_id} and job ${job_id}`);
    console.log(`[OPTIMIZE] Target score: ${target_score}, Max iterations: ${max_iterations}`);

    // Step 1: Create initial tailored resume
    console.log('[OPTIMIZE] Step 1: Creating initial tailored resume...');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tailoredContent = await tailorResumeToJob(baseResume as Resume, job as any, config as any);

    // Create tailored resume directly in DB
    // SECURITY: user_id is explicitly set to authenticated user
    const newResumeData = {
      ...tailoredContent,
      user_id: user.id,
      job_id: job_id,
      is_base_resume: false,
      first_name: baseResume.first_name,
      last_name: baseResume.last_name,
      email: baseResume.email,
      phone_number: baseResume.phone_number,
      location: baseResume.location,
      website: baseResume.website,
      linkedin_url: baseResume.linkedin_url,
      github_url: baseResume.github_url,
      document_settings: baseResume.document_settings,
      section_configs: baseResume.section_configs,
      section_order: baseResume.section_order,
      resume_title: `${job.position_title} at ${job.company_name}`,
      name: `${job.position_title} at ${job.company_name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: initialResume, error: createError } = await supabase
      .from('resumes')
      .insert([newResumeData])
      .select()
      .single();

    if (createError) {
      console.error('[OPTIMIZE] Error creating tailored resume:', createError);
      throw new Error('Failed to create tailored resume');
    }

    let currentResume = initialResume as Resume;
    const optimizationHistory: OptimizationHistory[] = [];
    let currentScore = 0;
    let targetAchieved = false;

    // Step 2: Optimization loop
    for (let iteration = 1; iteration <= max_iterations; iteration++) {
      console.log(`[OPTIMIZE] Iteration ${iteration}/${max_iterations}`);

      // Step 2a: Score current resume
      console.log(`[OPTIMIZE] Iteration ${iteration}: Scoring resume...`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoreResult = await generateResumeScore(currentResume, job as any, config as any);
      currentScore = scoreResult.overallScore.score;

      console.log(`[OPTIMIZE] Iteration ${iteration}: Score = ${currentScore}`);

      // Step 2b: Check if target achieved
      if (currentScore >= target_score) {
        console.log(`[OPTIMIZE] Target score ${target_score} achieved at iteration ${iteration}!`);
        targetAchieved = true;

        optimizationHistory.push({
          iteration,
          score: currentScore,
          changes: ['Target score achieved'],
          timestamp: new Date().toISOString(),
        });

        break;
      }

      // Step 2c: Generate optimization prompt
      console.log(`[OPTIMIZE] Iteration ${iteration}: Generating optimization prompt...`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const optimizationPrompt = generateOptimizationPrompt(scoreResult, currentResume, job as any);

      // Step 2d: Optimize resume content using AI
      console.log(`[OPTIMIZE] Iteration ${iteration}: Optimizing resume content...`);
      const { plan } = await getSubscriptionPlan(true);
      const isPro = plan === 'pro';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiClient = isPro ? initializeAIClient(config as any, isPro) : initializeAIClient(config as any);

      const { object: optimizedContent } = await generateObject({
        model: aiClient,
        schema: z.object({
          content: simplifiedResumeSchema,
          changes_made: z.array(z.string()).describe('List of specific changes made to the resume'),
        }),
        prompt: optimizationPrompt,
        temperature: 0.5,
      });

      // Step 2e: Update resume with optimized content directly in DB
      console.log(`[OPTIMIZE] Iteration ${iteration}: Updating resume...`);
      const updateData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(optimizedContent.content as any),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedResume, error: updateError } = await supabase
        .from('resumes')
        .update(updateData)
        .eq('id', currentResume.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('[OPTIMIZE] Error updating resume:', updateError);
        throw new Error('Failed to update resume');
      }

      currentResume = updatedResume as Resume;

      // Step 2f: Track iteration in history
      optimizationHistory.push({
        iteration,
        score: currentScore,
        changes: optimizedContent.changes_made,
        timestamp: new Date().toISOString(),
      });

      console.log(`[OPTIMIZE] Iteration ${iteration}: Changes made:`, optimizedContent.changes_made);
    }

    // Step 3: Final scoring
    console.log('[OPTIMIZE] Performing final scoring...');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalScore = await generateResumeScore(currentResume, job as any, config as any);

    console.log(`[OPTIMIZE] Optimization complete. Final score: ${finalScore.overallScore.score}`);

    return apiResponse(
      {
        resume: currentResume,
        score: finalScore,
        iterations: optimizationHistory.length,
        target_achieved: targetAchieved,
        optimization_history: optimizationHistory,
      },
      200
    );
  } catch (error) {
    console.error('[OPTIMIZE] Error:', error);
    return handleAPIError(error);
  }
}
