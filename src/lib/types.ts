export interface WorkExperience {
  company: string;
  position: string;
  location?: string;
  date: string;
  description: string[];
  technologies?: string[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  location?: string;
  date: string;
  gpa?: string;
  achievements?: string[];
}

export interface Project {
  name: string;
  description: string[];
  date?: string;
  technologies?: string[];
  url?: string;
  github_url?: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date_acquired?: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
}

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  job_url?: string;
  description?: string;
  location?: string;
  salary_range?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  status: 'active' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'archived';
  requirements?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SectionConfig {
  visible: boolean;
  max_items?: number | null;
  style?: 'grouped' | 'list' | 'grid';
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  target_role: string;
  is_base_resume: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  professional_summary?: string;
  work_experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  created_at: string;
  updated_at: string;
  document_settings?: DocumentSettings;
  section_order?: string[];
  section_configs?: {
    [key: string]: { visible: boolean };
  };
}

export interface DocumentSettings {
  // Header Settings
  header_name_size?: number;
  header_name_bottom_spacing?: number;

  // Skills Section
  skills_font_size?: number;
  skills_margin_top?: number;
  skills_margin_bottom?: number;
  skills_line_height?: number;
  skills_item_spacing?: number;

  // Experience Section
  experience_font_size?: number;
  experience_margin_top?: number;
  experience_margin_bottom?: number;
  experience_line_height?: number;
  experience_item_spacing?: number;

  // Projects Section
  projects_font_size?: number;
  projects_margin_top?: number;
  projects_margin_bottom?: number;
  projects_line_height?: number;
  projects_item_spacing?: number;

  // Education Section
  education_font_size?: number;
  education_margin_top?: number;
  education_margin_bottom?: number;
  education_line_height?: number;
  education_item_spacing?: number;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  work_experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  created_at: string;
  updated_at: string;
}