export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string[];
  technologies?: string[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  gpa?: number;
  achievements?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github_url?: string;
  start_date: string;
  end_date: string | null;
  highlights: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date_acquired: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
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
  professional_summary: string | null;
  work_experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  created_at: string;
  updated_at: string;
}