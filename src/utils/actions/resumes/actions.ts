'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume, WorkExperience, Education, Skill, Project, Job } from "@/lib/types";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { simplifiedResumeSchema, Job as ZodJob } from "@/lib/zod-schemas";
import { AIConfig } from "@/utils/ai-tools";
import { generateObject } from "ai";
import { initializeAIClient } from "@/utils/ai-tools";
import { resumeScoreSchema } from "@/lib/zod-schemas";
import { getSubscriptionPlan } from "../stripe/actions";
import { getSubscriptionAccessState } from "@/lib/subscription-access";
import {
  FREE_PLAN_RESUME_LIMITS,
  getResumeLimitExceededMessage,
  type ResumeLimitType,
} from "@/lib/resume-limits";

async function assertResumeQuota(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  type: ResumeLimitType
) {
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('subscription_plan, subscription_status, current_period_end, trial_end, stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error('Failed to validate subscription access');
  }

  const accessState = getSubscriptionAccessState(subscription);
  if (accessState.hasProAccess) {
    return;
  }

  const isBaseResume = type === 'base';
  const { count, error: countError } = await supabase
    .from('resumes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_base_resume', isBaseResume);

  if (countError) {
    throw new Error('Failed to validate resume limits');
  }

  const limit = FREE_PLAN_RESUME_LIMITS[type];
  if ((count ?? 0) >= limit) {
    throw new Error(getResumeLimitExceededMessage(type));
  }
}


//  SUPABASE ACTIONS
export async function getResumeById(resumeId: string): Promise<{ resume: Resume; profile: Profile; job: Job | null }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const [resumeResult, profileResult] = await Promise.all([
      supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ]);

    if (resumeResult.error || !resumeResult.data) {
      throw new Error('Resume not found');
    }

    if (profileResult.error || !profileResult.data) {
      throw new Error('Profile not found');
    }

    let job: Job | null = null;

    if (resumeResult.data.job_id) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', resumeResult.data.job_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (jobError) {
        console.error('Failed to fetch associated job:', jobError);
      } else {
        job = jobData;
      }
    }

    return { 
      resume: resumeResult.data, 
      profile: profileResult.data,
      job
    };
  } catch (error) {
    throw error;
  }
}

export async function updateResume(resumeId: string, data: Partial<Resume>): Promise<Resume> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  const { data: resume, error: updateError } = await supabase
    .from('resumes')
    .update(data)
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    throw new Error('Failed to update resume');
  }

  return resume;
}

export async function deleteResume(resumeId: string): Promise<void> {
    const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, name, job_id, is_base_resume')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !resume) {
      throw new Error('Resume not found or access denied');
    }

    if (!resume.is_base_resume && resume.job_id) {
      const { error: jobDeleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', resume.job_id)
        .eq('user_id', user.id);

      if (jobDeleteError) {
        console.error('Failed to delete associated job:', jobDeleteError);
      }
    }

    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error('Failed to delete resume');
    }

    revalidatePath('/', 'layout');
    revalidatePath('/resumes', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/resumes/base', 'layout');
    revalidatePath('/resumes/tailored', 'layout');
    revalidatePath('/jobs', 'layout');

  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete resume');
  }
}

export async function createBaseResume(
  name: string, 
  importOption: 'import-profile' | 'fresh' | 'import-resume' = 'import-profile',
  selectedContent?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    website?: string;
    linkedin_url?: string;
    github_url?: string;
    work_experience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
  }
): Promise<Resume> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  await assertResumeQuota(supabase, user.id, 'base');

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

  const { data: resume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError) {
    console.error('\nDatabase Insert Error:', {
      code: createError.code,
      message: createError.message,
      details: createError.details,
      hint: createError.hint
    });
    throw new Error(`Failed to create resume: ${createError.message}`);
  }

  if (!resume) {
    console.error('\nNo resume data returned after insert');
    throw new Error('Resume creation failed: No data returned');
  }

  return resume;
}

export async function createTailoredResume(
  baseResume: Resume,
  jobId: string | null,
  jobTitle: string,
  companyName: string,
  tailoredContent: z.infer<typeof simplifiedResumeSchema>
) {
  console.log('[createTailoredResume] Received jobId:', jobId);
  console.log('[createTailoredResume] baseResume ID:', baseResume?.id);
  console.log('[createTailoredResume] Is jobId valid UUID?:', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId || ''));

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  await assertResumeQuota(supabase, user.id, 'tailored');

  const newResume = {
    ...tailoredContent,
    user_id: user.id,
    job_id: jobId,
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
    resume_title: `${jobTitle} at ${companyName}`,
    name: `${jobTitle} at ${companyName}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function copyResume(resumeId: string): Promise<Resume> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  const { data: sourceResume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !sourceResume) {
    throw new Error('Resume not found or access denied');
  }

  await assertResumeQuota(supabase, user.id, sourceResume.is_base_resume ? 'base' : 'tailored');

  // Exclude auto-generated fields that shouldn't be copied
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _created_at, updated_at: _updated_at, ...resumeDataToCopy } = sourceResume;

  const newResume = {
    ...resumeDataToCopy,
    name: `${sourceResume.name} (Copy)`,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: copiedResume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to copy resume: ${createError.message}`);
  }

  if (!copiedResume) {
    throw new Error('Resume creation failed: No data returned');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/resumes', 'layout');
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/resumes/base', 'layout');
  revalidatePath('/resumes/tailored', 'layout');

  return copiedResume;
}

export async function countResumes(type: 'base' | 'tailored' | 'all'): Promise<number> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (type !== 'all') {
    query = query.eq('is_base_resume', type === 'base');
  }

  const { count, error: countError } = await query;

  if (countError) {
    throw new Error('Failed to count resumes');
  }

  return count || -1;
}


export async function generateResumeScore(
  resume: Resume, 
  job?: ZodJob | null,
  config?: AIConfig
) {
  

  const subscriptionPlan = await getSubscriptionPlan();
  const isPro = subscriptionPlan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);

  const isTailoredResume = job && !resume.is_base_resume;

  const resumeForScoring = {
    target_role: resume.target_role,
    is_base_resume: resume.is_base_resume,
    contact: {
      first_name: resume.first_name,
      last_name: resume.last_name,
      email: resume.email,
      phone_number: resume.phone_number,
      location: resume.location,
      website: resume.website,
      linkedin_url: resume.linkedin_url,
      github_url: resume.github_url,
    },
    work_experience: resume.work_experience,
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
  };

  const jobForScoring = job
    ? {
        company_name: job.company_name,
        position_title: job.position_title,
        description: job.description,
        location: job.location,
        salary_range: job.salary_range,
        keywords: job.keywords,
        work_location: job.work_location,
        employment_type: job.employment_type,
      }
    : null;

  try {
    const systemPrompt = `You are an expert resume analyst and career coach. You provide precise, actionable resume scoring based on proven best practices from professional recruiters, ATS systems, and hiring managers.

SCORING SCALE (apply consistently):
- 0-30: Critical issues. Missing essential content or major problems that would cause immediate rejection.
- 31-50: Below average. Significant gaps or weak content that reduces competitiveness.
- 51-70: Average. Meets basic standards but has clear room for improvement.
- 71-85: Good. Solid resume with minor areas to polish.
- 86-100: Excellent. Professional-grade content that stands out. Reserve 95+ for truly exceptional resumes.

Be honest and calibrated. Most resumes should score between 45-75. Do not inflate scores.

SCORING CRITERIA:

1. COMPLETENESS
   - contactInformation: Does the resume include name, email, phone, location, and relevant links (LinkedIn/GitHub/portfolio)? Missing any = lower score.
   - detailLevel: Are work experiences, projects, and education described with sufficient detail? Are there enough bullet points per role (3-5 ideal)?

2. IMPACT SCORE
   - activeVoiceUsage: Do bullet points start with strong action verbs (Engineered, Led, Optimized, etc.)? Penalize passive voice, weak verbs (helped, worked on, responsible for).
   - quantifiedAchievements: Are achievements backed by specific metrics (%, $, time saved, users, team size)? At least 40% of bullets should have quantified results.

3. ROLE MATCH
   - skillsRelevance: Are listed skills relevant to the target role? Are critical skills for the role present?
   - experienceAlignment: Does work experience demonstrate progression and relevance to the target role?
   - educationFit: Is education relevant? Is GPA included when strong (>3.5)? Are relevant coursework/achievements listed?

4. ATS COMPATIBILITY
   - keywordOptimization: Does the resume use industry-standard terminology and keywords for the target role? Are key technical terms and tools mentioned?
   - formatting: Is the resume well-formatted for ATS parsing? Clean section headers, no tables/graphics that ATS can't read, standard section names.
   - sectionStructure: Are sections logically ordered (skills near top for technical roles)? Are standard sections present (Experience, Education, Skills, Projects)?

5. BREVITY & CLARITY
   - conciseness: Are bullet points concise (1-2 lines each)? No filler words or unnecessary verbosity? Total resume length appropriate (1-2 pages)?
   - bulletPointQuality: Does each bullet follow the formula: [Action Verb] + [Task/Context] + [Result/Impact]? No duty-listing without impact?
   - readability: Is language clear and professional? No jargon without context? Consistent tense and formatting?

PRIORITIZED ACTIONS:
Provide 3-5 specific, actionable improvements ranked by impact. Each action should:
- Have a clear priority level (high/medium/low)
- Specify which category it belongs to (e.g., "Impact", "ATS", "Completeness")
- Give a concrete, specific instruction the user can immediately act on

OVERALL SCORE CALCULATION:
Weight the categories as follows:
- Impact Score: 25%
- Role Match: 25%
- ATS Compatibility: 20%
- Completeness: 15%
- Brevity & Clarity: 15%

Provide 3-5 overall improvement suggestions in 'overallImprovements'. Each should be specific and actionable, not generic advice.`;

    let userPrompt = `Analyze and score this resume for the target role of "${resumeForScoring.target_role}".

RESUME DATA:
${JSON.stringify(resumeForScoring, null, 2)}`;

    if (isTailoredResume) {
      userPrompt += `

THIS IS A TAILORED RESUME for a specific job. Set 'isTailoredResume' to true.

JOB DETAILS:
${JSON.stringify(jobForScoring, null, 2)}

ADDITIONAL ANALYSIS REQUIRED for 'jobAlignment':

1. KEYWORD MATCH: Compare resume content against the job description. List all matched keywords and all critical missing keywords. Score based on coverage of important terms.

2. REQUIREMENTS MATCH: Map each stated job requirement to evidence in the resume. List which requirements are clearly demonstrated and which have gaps.

3. COMPANY FIT: Assess how well the resume positions the candidate for this specific company and role. Provide actionable suggestions.

Also provide 'jobSpecificImprovements' with 3-5 targeted suggestions to better align with this specific job. Weight overall score more heavily on job alignment (add ~10% weight from other categories to job alignment).`;
    } else {
      userPrompt += `

This is a base resume (not tailored to a specific job). Set 'isTailoredResume' to false. Do NOT include the 'jobAlignment' field. Focus on general resume strength and best practices.`;
    }

    const { object } = await generateObject({
      model: aiClient,
      schema: resumeScoreSchema,
      system: systemPrompt,
      prompt: userPrompt
    });

    return object
  } catch (error) {
    console.error('Error SCORING resume:', error);
    throw error;
  }
}
