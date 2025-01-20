import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';
import { LoadingFallback } from './shared/LoadingFallback';

export const WorkExperienceForm = dynamic(
  () => import('./forms/work-experience-form').then(mod => ({ default: mod.WorkExperienceForm })) as Promise<ComponentType<any>>,
  {
    loading: () => <LoadingFallback lines={2} />,
    ssr: false
  }
);

export const EducationForm = dynamic(
  () => import('./forms/education-form').then(mod => ({ default: mod.EducationForm })) as Promise<ComponentType<any>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);

export const SkillsForm = dynamic(
  () => import('./forms/skills-form').then(mod => ({ default: mod.SkillsForm })) as Promise<ComponentType<any>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);

export const ProjectsForm = dynamic(
  () => import('./forms/projects-form').then(mod => ({ default: mod.ProjectsForm })) as Promise<ComponentType<any>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);

export const CertificationsForm = dynamic(
  () => import('./forms/certifications-form').then(mod => ({ default: mod.CertificationsForm })) as Promise<ComponentType<any>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
);

export const DocumentSettingsForm = dynamic(
  () => import('./forms/document-settings-form').then(mod => ({ default: mod.DocumentSettingsForm })) as Promise<ComponentType<any>>,
  {
    loading: () => <LoadingFallback lines={1} />,
    ssr: false
  }
); 