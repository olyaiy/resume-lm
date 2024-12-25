'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume } from "@/lib/types";
import { revalidatePath } from 'next/cache';
import { importProfileToResume } from "@/utils/ai";

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

export async function updateResume(resumeId: string, data: Partial<Resume>): Promise<Resume> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: resume, error } = await supabase
    .from('resumes')
    .update(data)
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update resume');
  }

  return resume;
}

export async function importResume(data: Partial<Profile>): Promise<Profile> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // First, get the current profile
  const { data: currentProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch current profile: ${fetchError.message}`);
  }

  // Prepare the update data
  const updateData: Partial<Profile> = {};

  // Handle simple string fields - only update if current value is null/empty
  const simpleFields = ['first_name', 'last_name', 'email', 'phone_number', 
    'location', 'website', 'linkedin_url', 'github_url'] as const;
  
  simpleFields.forEach((field) => {
    if (data[field] !== undefined) {
      // Only update if current value is null or empty string
      if (!currentProfile[field]) {
        updateData[field] = data[field];
      }
    }
  });

  // Handle array fields - append to existing arrays
  const arrayFields = ['work_experience', 'education', 'skills', 
    'projects', 'certifications'] as const;
  
  arrayFields.forEach((field) => {
    if (data[field]?.length) {
      // Simply append new items to the existing array
      updateData[field] = [
        ...(currentProfile[field] || []),
        ...data[field]
      ];
    }
  });

  // Only proceed with update if there are changes
  if (Object.keys(updateData).length === 0) {
    return currentProfile;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  // Revalidate all routes that might display profile data
  revalidatePath('/', 'layout');
  revalidatePath('/profile/edit', 'layout');
  revalidatePath('/resumes', 'layout');
  revalidatePath('/profile', 'layout');

  return profile;
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  // Revalidate all routes that might display profile data
  revalidatePath('/', 'layout');
  revalidatePath('/profile/edit', 'layout');
  revalidatePath('/resumes', 'layout');
  revalidatePath('/profile', 'layout');

  return profile;
}

export async function resetProfile(): Promise<Profile> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const emptyProfile: Partial<Profile> = {
    first_name: null,
    last_name: null,
    email: null,
    phone_number: null,
    location: null,
    website: null,
    linkedin_url: null,
    github_url: null,
    work_experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(emptyProfile)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to reset profile');
  }

  return profile;
}

export async function deleteResume(resumeId: string): Promise<void> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  try {
    // First verify the resume exists and belongs to the user
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, name')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !resume) {
      throw new Error('Resume not found or access denied');
    }

    // Then delete the resume
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error('Failed to delete resume');
    }

    // Revalidate all routes that might display resumes
    revalidatePath('/', 'layout');
    revalidatePath('/resumes', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/resumes/base', 'layout');
    revalidatePath('/resumes/tailored', 'layout');

  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete resume');
  }
}

export async function createBaseResume(name: string, importOption: 'import-all' | 'ai' | 'fresh' = 'import-all'): Promise<Resume> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  console.log('\n=== Creating Base Resume ===');
  console.log('Target Role:', name);
  console.log('Import Option:', importOption);

  // Get user's profile for initial data if not starting fresh
  let profile = null;
  if (importOption !== 'fresh') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profile = data;
    
    if (profile) {
      console.log('Profile found:', {
        name: `${profile.first_name} ${profile.last_name}`,
        experiences: profile.work_experience?.length || 0,
        skills: profile.skills?.length || 0,
        projects: profile.projects?.length || 0
      });
    }
  }

  // For AI option, get AI recommendations
  let aiRecommendations = null;
  if (importOption === 'ai' && profile) {
    try {
      console.log('\nRequesting AI Analysis...');
      aiRecommendations = await importProfileToResume(profile, name);
      console.log('AI Analysis completed successfully');
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      console.log('Proceeding with empty resume creation');
    }
  }

  const newResume: Partial<Resume> = {
    user_id: user.id,
    name,
    target_role: name,
    is_base_resume: true,
    // Pre-fill with profile data if available and not starting fresh
    first_name: importOption === 'fresh' ? '' : profile?.first_name || '',
    last_name: importOption === 'fresh' ? '' : profile?.last_name || '',
    email: importOption === 'fresh' ? '' : profile?.email || '',
    phone_number: importOption === 'fresh' ? '' : profile?.phone_number || '',
    location: importOption === 'fresh' ? '' : profile?.location || '',
    website: importOption === 'fresh' ? '' : profile?.website || '',
    linkedin_url: importOption === 'fresh' ? '' : profile?.linkedin_url || '',
    github_url: importOption === 'fresh' ? '' : profile?.github_url || '',
    professional_summary: '', // Always start with empty professional summary
    // For array fields, handle differently based on importOption
    work_experience: importOption === 'import-all' ? [...(profile?.work_experience || [])] : [],
    education: importOption === 'import-all' ? [...(profile?.education || [])] : [],
    skills: importOption === 'import-all' ? [...(profile?.skills || [])] : [],
    projects: importOption === 'import-all' ? [...(profile?.projects || [])] : [],
    certifications: importOption === 'import-all' ? [...(profile?.certifications || [])] : [],
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

  console.log('\nCreating resume with configuration:', {
    name: newResume.name,
    targetRole: newResume.target_role,
    isBaseResume: newResume.is_base_resume,
    sections: Object.keys(newResume.section_configs || {})
  });

  const { data: resume, error: createError } = await supabase
    .from('resumes')
    .insert([newResume])
    .select()
    .single();

  if (createError || !resume) {
    console.error('Error creating resume:', createError);
    throw new Error('Failed to create resume');
  }

  console.log('Resume created successfully:', {
    id: resume.id,
    name: resume.name
  });
  console.log('=== End Create Base Resume ===\n');

  return resume;
} 