'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume } from "@/lib/types";
import { revalidatePath } from 'next/cache';

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
  console.log('🚀 Starting deleteResume with ID:', resumeId);
  
  const supabase = await createClient();
  console.log('📡 Supabase client created');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('👤 Auth check result:', { userId: user?.id, hasError: !!userError });
  
  if (userError || !user) {
    console.error('❌ Authentication error:', userError);
    throw new Error('User not authenticated');
  }

  try {
    console.log('🔍 Verifying resume ownership for:', { resumeId, userId: user.id });
    
    // First verify the resume exists and belongs to the user
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, name')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    console.log('📋 Fetch resume result:', {
      found: !!resume,
      resumeData: resume,
      hasError: !!fetchError,
      errorDetails: fetchError
    });

    if (fetchError) {
      console.error('❌ Resume fetch error:', fetchError);
      throw new Error(fetchError.message || 'Resume not found or access denied');
    }

    if (!resume) {
      console.error('❌ Resume not found for:', { resumeId, userId: user.id });
      throw new Error('Resume not found or access denied');
    }

    console.log('🗑️ Attempting to delete resume:', { 
      resumeId: resume.id, 
      resumeName: resume.name 
    });

    // Then delete the resume
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', user.id);

    console.log('🗑️ Delete operation result:', {
      success: !deleteError,
      hasError: !!deleteError,
      errorDetails: deleteError
    });

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      throw new Error(deleteError.message || 'Failed to delete resume');
    }

    console.log('✅ Resume deleted successfully:', resumeId);

    // Revalidate all routes that might display resumes
    console.log('🔄 Starting route revalidation');
    revalidatePath('/', 'layout');
    revalidatePath('/resumes', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/resumes/base', 'layout');
    revalidatePath('/resumes/tailored', 'layout');
    console.log('✅ Route revalidation complete');

  } catch (error) {
    console.error('❌ Delete resume error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      resumeId,
      userId: user.id
    });
    throw error instanceof Error ? error : new Error('Failed to delete resume');
  }
} 