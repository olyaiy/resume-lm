'use server'

import { createClient } from "@/utils/supabase/server";
import { Profile, Resume, WorkExperience, Education, Skill, Project } from "@/lib/types";
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

export async function getResumeById(resumeId: string): Promise<{ resume: Resume; profile: Profile }> {
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

  // Fetch the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Profile not found');
  }

  return { resume, profile };
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

export async function createBaseResume(
  name: string, 
  importOption: 'import-all' | 'ai' | 'fresh' = 'import-all',
  selectedContent?: {
    work_experience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
  }
): Promise<Resume> {
  console.log('\n========== CREATE BASE RESUME START ==========');
  console.log('Input Parameters:', { name, importOption, hasSelectedContent: !!selectedContent });

  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Authentication Error:', userError);
    throw new Error('User not authenticated');
  }
  console.log('User authenticated:', { userId: user.id });

  // Get user's profile for initial data if not starting fresh
  let profile = null;
  if (importOption !== 'fresh') {
    console.log('\nFetching user profile...');
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
    
    profile = data;
    console.log('Profile fetch result:', {
      success: !!data,
      hasWorkExperience: Array.isArray(data?.work_experience),
      workExperienceCount: data?.work_experience?.length || 0,
      hasEducation: Array.isArray(data?.education),
      educationCount: data?.education?.length || 0,
      hasSkills: Array.isArray(data?.skills),
      skillsCount: data?.skills?.length || 0,
      hasProjects: Array.isArray(data?.projects),
      projectsCount: data?.projects?.length || 0
    });
  }

  // For AI option, get AI recommendations if not provided
  let aiRecommendations: Partial<Resume> | undefined;
  if (importOption === 'ai' && profile) {
    try {
      console.log('\nRequesting AI Analysis...');
      const aiResponse = await importProfileToResume(profile, name);
      console.log('\nAI Response received:', {
        type: typeof aiResponse,
        isString: typeof aiResponse === 'string',
        length: typeof aiResponse === 'string' ? aiResponse.length : 'N/A'
      });

      if (typeof aiResponse === 'string') {
        console.log('AI Response Preview:', aiResponse.substring(0, 200) + '...');
      }

      aiRecommendations = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
      
      console.log('\nParsed AI Recommendations:', {
        success: !!aiRecommendations,
        hasWorkExperience: Array.isArray(aiRecommendations?.work_experience),
        workExperienceCount: aiRecommendations?.work_experience?.length || 0,
        workExperienceExample: aiRecommendations?.work_experience?.[0]?.company,
        hasEducation: Array.isArray(aiRecommendations?.education),
        educationCount: aiRecommendations?.education?.length || 0,
        hasSkills: Array.isArray(aiRecommendations?.skills),
        skillsCount: aiRecommendations?.skills?.length || 0,
        hasProjects: Array.isArray(aiRecommendations?.projects),
        projectsCount: aiRecommendations?.projects?.length || 0
      });
    } catch (error) {
      console.error('\nAI Analysis Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.log('Proceeding with empty resume creation');
    }
  }

  console.log('\nPreparing new resume data...');
  const newResume: Partial<Resume> = {
    user_id: user.id,
    name,
    target_role: name,
    is_base_resume: true,
    first_name: aiRecommendations?.first_name || (importOption === 'fresh' ? '' : profile?.first_name || ''),
    last_name: aiRecommendations?.last_name || (importOption === 'fresh' ? '' : profile?.last_name || ''),
    email: aiRecommendations?.email || (importOption === 'fresh' ? '' : profile?.email || ''),
    phone_number: aiRecommendations?.phone_number || (importOption === 'fresh' ? '' : profile?.phone_number || ''),
    location: aiRecommendations?.location || (importOption === 'fresh' ? '' : profile?.location || ''),
    website: aiRecommendations?.website || (importOption === 'fresh' ? '' : profile?.website || ''),
    linkedin_url: aiRecommendations?.linkedin_url || (importOption === 'fresh' ? '' : profile?.linkedin_url || ''),
    github_url: aiRecommendations?.github_url || (importOption === 'fresh' ? '' : profile?.github_url || ''),
    work_experience: importOption === 'ai' && Array.isArray(aiRecommendations?.work_experience) 
      ? [...aiRecommendations.work_experience]
      : (importOption === 'import-all' && Array.isArray(profile?.work_experience) 
        ? [...profile.work_experience] 
        : selectedContent?.work_experience || []),
    education: importOption === 'ai' && Array.isArray(aiRecommendations?.education)
      ? [...aiRecommendations.education]
      : (importOption === 'import-all' && Array.isArray(profile?.education) 
        ? [...profile.education] 
        : selectedContent?.education || []),
    skills: importOption === 'ai' && Array.isArray(aiRecommendations?.skills)
      ? [...aiRecommendations.skills]
      : (importOption === 'import-all' && Array.isArray(profile?.skills) 
        ? [...profile.skills] 
        : selectedContent?.skills || []),
    projects: importOption === 'ai' && Array.isArray(aiRecommendations?.projects)
      ? [...aiRecommendations.projects]
      : (importOption === 'import-all' && Array.isArray(profile?.projects) 
        ? [...profile.projects] 
        : selectedContent?.projects || []),
    certifications: importOption === 'ai' && Array.isArray(aiRecommendations?.certifications)
      ? [...aiRecommendations.certifications]
      : (importOption === 'import-all' && Array.isArray(profile?.certifications) 
        ? [...profile.certifications] 
        : []),
    section_order: [
      'work_experience',
      'education',
      'skills',
      'projects',
      'certifications'
    ],
    section_configs: {
      work_experience: { visible: true },
      education: { visible: true },
      skills: { visible: true },
      projects: { visible: true },
      certifications: { visible: true }
    }
  };

  console.log('\nPrepared Resume Data:', {
    basicInfo: {
      name: newResume.name,
      targetRole: newResume.target_role,
      isBaseResume: newResume.is_base_resume,
      firstName: newResume.first_name,
      lastName: newResume.last_name,
    },
    arrayFields: {
      workExperience: {
        isArray: Array.isArray(newResume.work_experience),
        length: newResume.work_experience?.length || 0,
        firstItem: newResume.work_experience?.[0]?.company || 'none'
      },
      education: {
        isArray: Array.isArray(newResume.education),
        length: newResume.education?.length || 0,
        firstItem: newResume.education?.[0]?.school || 'none'
      },
      skills: {
        isArray: Array.isArray(newResume.skills),
        length: newResume.skills?.length || 0,
        firstItem: newResume.skills?.[0]?.category || 'none'
      },
      projects: {
        isArray: Array.isArray(newResume.projects),
        length: newResume.projects?.length || 0,
        firstItem: newResume.projects?.[0]?.name || 'none'
      }
    },
    sections: {
      orderLength: newResume.section_order?.length || 0,
      configKeys: Object.keys(newResume.section_configs || {})
    }
  });

  console.log('\nInserting resume into database...');
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

  console.log('\nCreated Resume:', {
    id: resume.id,
    name: resume.name,
    arrays: {
      workExperience: resume.work_experience?.length || 0,
      education: resume.education?.length || 0,
      skills: resume.skills?.length || 0,
      projects: resume.projects?.length || 0,
      certifications: resume.certifications?.length || 0
    }
  });

  console.log('========== CREATE BASE RESUME END ==========\n');
  return resume;
} 


