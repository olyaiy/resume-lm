import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';
import { LoadingFallback } from './shared/LoadingFallback';
import type { WorkExperience, Education, Skill, Project, DocumentSettings } from '@/lib/types';

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
  profile: { work_experience: WorkExperience[] };
  targetRole?: string;
}

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  profile: { projects: Project[] };
}

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  profile: { education: Education[] };
}



interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  profile: { skills: Skill[] };
}

export const WorkExperienceForm = dynamic(
  () => import('./forms/work-experience-form').then(mod => ({ default: mod.WorkExperienceForm })) as Promise<ComponentType<WorkExperienceFormProps>>,
  {
    loading: () => <LoadingFallback lines={2} />,
    ssr: false
  }
);

export const EducationForm = dynamic(
  () => import('./forms/education-form').then(mod => ({ default: mod.EducationForm })) as Promise<ComponentType<EducationFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);

export const SkillsForm = dynamic(
  () => import('./forms/skills-form').then(mod => ({ default: mod.SkillsForm })) as Promise<ComponentType<SkillsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);

export const ProjectsForm = dynamic(
  () => import('./forms/projects-form').then(mod => ({ default: mod.ProjectsForm })) as Promise<ComponentType<ProjectsFormProps>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);


export const DocumentSettingsForm = dynamic(
  () => import('./forms/document-settings-form').then(mod => ({ 
    default: mod.DocumentSettingsForm 
  })) as Promise<ComponentType<{ 
    documentSettings: DocumentSettings; 
    onChange: (field: 'document_settings', value: DocumentSettings) => void 
  }>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);