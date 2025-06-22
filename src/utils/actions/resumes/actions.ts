'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume, WorkExperience, Education, Skill, Project } from "@/lib/types";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { simplifiedResumeSchema, Job } from "@/lib/zod-schemas";
import { AIConfig } from "@/utils/ai-tools";
import { generateObject } from "ai";
import { initializeAIClient } from "@/utils/ai-tools";
import { resumeScoreSchema } from "@/lib/zod-schemas";
import { getSubscriptionPlan } from "../stripe/actions";


//  SUPABASE ACTIONS
export async function getResumeById(resumeId: string): Promise<{ resume: Resume; profile: Profile }> {
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

    return { 
      resume: resumeResult.data, 
      profile: profileResult.data 
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
  job?: Job | null,
  config?: AIConfig
) {
  

  const subscriptionPlan = await getSubscriptionPlan();
  const isPro = subscriptionPlan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);

  const isTailoredResume = job && !resume.is_base_resume;

  console.log("RESUME IS", resume);
  console.log("JOB IS", job);
  console.log("IS TAILORED RESUME", isTailoredResume);

  try {
    let prompt = `
    Generate a comprehensive score for this resume: ${JSON.stringify(resume)}
    
    MUST include a 'miscellaneous' field with 2-3 metrics following this format:
    {
      "metricName": {
        "score": number,
        "reason": "string explanation"
      }
    }
    Example: 
    "keywordOptimization": {
      "score": 85,
      "reason": "Good use of industry keywords but could add more variation"
    }
    `;

    // Enhanced prompt for tailored resumes with job context
    if (isTailoredResume) {
      prompt += `
      
      THIS IS A TAILORED RESUME FOR A SPECIFIC JOB. Job details: ${JSON.stringify(job)}
      
      IMPORTANT: Since this is a tailored resume, you MUST include the 'jobAlignment' field with detailed analysis:
      
      1. KEYWORD MATCH ANALYSIS:
         - Compare resume content with job description keywords
         - Identify matched keywords and missing critical keywords
         - Score based on keyword density and relevance
      
      2. REQUIREMENTS MATCH ANALYSIS:
         - Analyze how well the resume addresses job requirements
         - Identify which requirements are clearly addressed
         - Highlight gaps where requirements aren't demonstrated
      
      3. COMPANY FIT ANALYSIS:
         - Assess alignment with company culture/values (if mentioned in job description)
         - Evaluate positioning for this specific role
         - Suggest improvements for better company alignment
      
      ALSO INCLUDE:
      - Set 'isTailoredResume' to true
      - Provide 'jobSpecificImprovements' with 3-5 specific suggestions for this job
      - Weight the overall score more heavily on job alignment factors
      
      Focus on actionable insights that help the candidate better align their resume with this specific opportunity.
      `;
    } else {
      prompt += `
      
      This is a base resume (not tailored to a specific job).
      - Set 'isTailoredResume' to false
      - Do NOT include the 'jobAlignment' field
      - Focus on general resume best practices and improvements
      `;
    }

    const { object } = await generateObject({
      model: aiClient,
      schema: resumeScoreSchema,
      prompt
    });

    // console.log("THE OUTPUTTED object", object);
    return object
  } catch (error) {
    console.error('Error SCORING resume:', error);
    throw error;
  }
}
