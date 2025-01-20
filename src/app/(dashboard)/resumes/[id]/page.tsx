import { redirect } from "next/navigation";
import { getResumeById } from "@/utils/actions";
import { ResumeEditorClient } from "@/components/resume/editor/resume-editor-client";
import { Metadata } from "next";
import { Resume } from "@/lib/types";

// Helper function to normalize resume data
function normalizeResumeData(resume: Resume): Resume {
  return {
    ...resume,
    // Normalize work experience dates
    work_experience: resume.work_experience?.map(exp => ({
      ...exp,
      date: exp.date || ''
    })) || [],
    // Normalize education dates
    education: resume.education?.map(edu => ({
      ...edu,
      date: edu.date || ''
    })) || [],
    // Normalize project dates
    projects: resume.projects?.map(project => ({
      ...project,
      date: project.date || ''
    })) || [],
    // Initialize document settings with defaults if not present
    document_settings: resume.document_settings || {
      document_font_size: 10,
      document_line_height: 1.5,
      document_margin_vertical: 36,
      document_margin_horizontal: 36,
      header_name_size: 24,
      header_name_bottom_spacing: 24,
      skills_margin_top: 2,
      skills_margin_bottom: 2,
      skills_margin_horizontal: 0,
      skills_item_spacing: 2,
      experience_margin_top: 2,
      experience_margin_bottom: 2,
      experience_margin_horizontal: 0,
      experience_item_spacing: 4,
      projects_margin_top: 2,
      projects_margin_bottom: 2,
      projects_margin_horizontal: 0,
      projects_item_spacing: 4,
      education_margin_top: 2,
      education_margin_bottom: 2,
      education_margin_horizontal: 0,
      education_item_spacing: 4
    }
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const { resume } = await getResumeById(id);
    return {
      title: `${resume.name} | ResumeLM`,
      description: `Editing ${resume.name} - ${resume.target_role} resume`,
    };
  } catch (error) {
    void error;
    return {
      title: 'Resume Editor | ResumeLM',
      description: 'AI-powered resume editor',
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  console.time('🔍 [Page] Total Load Time');
  console.time('⚙️ [Page] Initial Setup');
  
  try {
    const { id } = await params;
    console.timeEnd('⚙️ [Page] Initial Setup');

    console.time('📊 [Data] Resume Fetch & Process');
    const { resume: rawResume, profile } = await getResumeById(id);
    console.timeEnd('📊 [Data] Resume Fetch & Process');
    
    console.time('🔄 [Data] Normalization');
    const normalizedResume = normalizeResumeData(rawResume);
    console.timeEnd('🔄 [Data] Normalization');
    
    console.time('🎨 [Render] Component Build');
    const component = (
      <div 
        className="h-[calc(100vh-4rem)] overflow-hidden"
        data-page-title={normalizedResume.name}
        data-resume-type={normalizedResume.is_base_resume ? "Base Resume" : "Tailored Resume"}
      >
        <ResumeEditorClient initialResume={normalizedResume} profile={profile} />
      </div>
    );
    console.timeEnd('🎨 [Render] Component Build');
    
    console.timeEnd('🔍 [Page] Total Load Time');
    console.log('📝 [Resume] Details:', {
      name: normalizedResume.name,
      type: normalizedResume.is_base_resume ? "Base Resume" : "Tailored Resume",
      sections: {
        workExperience: normalizedResume.work_experience?.length || 0,
        education: normalizedResume.education?.length || 0,
        projects: normalizedResume.projects?.length || 0,
        skills: normalizedResume.skills?.length || 0,
      }
    });
    
    return component;
  } catch (error) {
    console.timeEnd('🔍 [Page] Total Load Time');
    console.error('❌ [Error]:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      redirect("/auth/login");
    }
    redirect("/");
  }
} 