'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume } from "@/lib/types";

interface DashboardData {
  profile: Profile | null;
  baseResumes: Resume[];
  tailoredResumes: Resume[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch resumes data
  const { data: resumes, error: resumesError } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id);

  if (profileError || resumesError) {
    console.error('Error fetching data:', { profileError, resumesError });
    throw new Error('Error fetching dashboard data');
  }

  const baseResumes = resumes?.filter(resume => resume.is_base_resume) ?? [];
  const tailoredResumes = resumes?.filter(resume => !resume.is_base_resume) ?? [];

  return {
    profile,
    baseResumes,
    tailoredResumes
  };
}

export async function getResumeById(resumeId: string): Promise<Resume> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Fetch the specific resume
  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single();

  if (resumeError || !resume) {
    throw new Error('Resume not found');
  }

  return resume;
}

export async function deleteResume(resumeId: string): Promise<void> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Delete the resume
  const { error: deleteError } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', user.id); // Ensure user can only delete their own resumes

  if (deleteError) {
    console.error('Error deleting resume:', deleteError);
    throw new Error('Failed to delete resume');
  }
}

export async function createBaseResume(name: string): Promise<Resume> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Get user's profile for initial data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const newResume: Partial<Resume> = {
    user_id: user.id,
    name,
    is_base_resume: true,
    // Pre-fill with profile data if available
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone_number: profile?.phone_number || '',
    location: profile?.location || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
    github_url: profile?.github_url || '',
    professional_summary: profile?.professional_summary || '',
    work_experience: profile?.work_experience || [],
    education: profile?.education || [],
    skills: profile?.skills || [],
    projects: profile?.projects || [],
    certifications: profile?.certifications || [],
    section_order: [
      'professional_summary',
      'work_experience',
      'education',
      'skills',
      'projects',
      'certifications'
    ],
    section_configs: {
      professional_summary: { visible: true },
      work_experience: { visible: true },
      education: { visible: true },
      skills: { visible: true },
      projects: { visible: true },
      certifications: { visible: true }
    }
  };

  const { data: resume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError || !resume) {
    console.error('Error creating resume:', createError);
    throw new Error('Failed to create resume');
  }

  return resume;
}

export async function createTailoredResume(baseResumeId: string, jobId: string, name: string): Promise<Resume> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Get base resume data
  const { data: baseResume, error: baseResumeError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', baseResumeId)
    .eq('user_id', user.id)
    .single();

  if (baseResumeError || !baseResume) {
    throw new Error('Base resume not found');
  }

  const newResume: Partial<Resume> = {
    ...baseResume,
    id: undefined, // Remove the base resume's ID
    name,
    is_base_resume: false,
    job_id: jobId,
    created_at: undefined,
    updated_at: undefined
  };

  const { data: resume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError || !resume) {
    console.error('Error creating tailored resume:', createError);
    throw new Error('Failed to create tailored resume');
  }

  return resume;
} 