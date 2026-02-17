import { z } from 'zod';
import {
  workExperienceSchema,
  educationSchema,
  projectSchema,
  skillSchema,
  simplifiedJobSchema,
} from './zod-schemas';

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ============================================================================
// Job Schemas
// ============================================================================

export const createJobRequestSchema = simplifiedJobSchema.extend({
  company_name: z.string().min(1, 'Company name is required'),
  position_title: z.string().min(1, 'Position title is required'),
});

export const updateJobRequestSchema = simplifiedJobSchema.partial();

export const getJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  is_active: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ============================================================================
// Resume Schemas
// ============================================================================

export const createResumeRequestSchema = z.object({
  name: z.string().min(1, 'Resume name is required'),
  target_role: z.string().min(1, 'Target role is required'),
  job_id: z.string().uuid().optional().nullable(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  linkedin_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  work_experience: z.array(workExperienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
});

export const updateResumeRequestSchema = createResumeRequestSchema.partial();

export const getResumesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  is_base_resume: z.coerce.boolean().optional(),
  job_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

// ============================================================================
// AI Operation Schemas
// ============================================================================

export const tailorResumeRequestSchema = z.object({
  resume_id: z.string().uuid('Invalid resume ID'),
  job_id: z.string().uuid('Invalid job ID'),
  options: z
    .object({
      focus_areas: z.array(z.string()).optional(),
      preserve_structure: z.boolean().default(true).optional(),
      optimization_level: z.enum(['light', 'moderate', 'aggressive']).default('moderate').optional(),
    })
    .optional(),
});

export const optimizeResumeRequestSchema = z.object({
  resume_id: z.string().uuid('Invalid resume ID'),
  section: z
    .enum(['work_experience', 'education', 'skills', 'projects', 'all'])
    .default('all')
    .optional(),
  options: z
    .object({
      improve_ats: z.boolean().default(true).optional(),
      enhance_impact: z.boolean().default(true).optional(),
      add_metrics: z.boolean().default(true).optional(),
    })
    .optional(),
});

export const scoreResumeRequestSchema = z.object({
  resume_id: z.string().uuid('Invalid resume ID'),
  job_id: z.string().uuid().optional().nullable(),
  criteria: z
    .object({
      ats_compatibility: z.boolean().default(true).optional(),
      keyword_match: z.boolean().default(true).optional(),
      impact_assessment: z.boolean().default(true).optional(),
      completeness: z.boolean().default(true).optional(),
    })
    .optional(),
});

export const generateCoverLetterRequestSchema = z.object({
  resume_id: z.string().uuid('Invalid resume ID'),
  job_id: z.string().uuid('Invalid job ID'),
  tone: z.enum(['professional', 'enthusiastic', 'creative', 'formal']).default('professional').optional(),
  length: z.enum(['short', 'medium', 'long']).default('medium').optional(),
});

export const improveTextRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  context: z.enum(['work_experience', 'project', 'summary', 'skill', 'general']).optional(),
  goal: z
    .enum(['clarity', 'impact', 'brevity', 'ats_optimization', 'all'])
    .default('all')
    .optional(),
});

export const optimizeWorkflowRequestSchema = z.object({
  base_resume_id: z.string().uuid('Invalid base resume ID'),
  job_id: z.string().uuid('Invalid job ID'),
  target_score: z.number().min(0).max(100).default(85),
  max_iterations: z.number().int().min(1).max(10).default(5),
  config: z
    .object({
      model: z.string().optional(),
      apiKeys: z.array(z.string()).optional(),
      customPrompts: z.any().optional(),
    })
    .optional(),
});

export const optimizeChatRequestSchema = z.object({
  resume_id: z.string().uuid('Invalid resume ID'),
  message: z.string().min(1, 'Message is required'),
  job_id: z.string().uuid('Invalid job ID').optional(),
  config: z
    .object({
      model: z.string().optional(),
      apiKeys: z.array(z.string()).optional(),
      customPrompts: z.any().optional(),
    })
    .optional(),
});

// ============================================================================
// Response Type Interfaces
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface APIResponse<T> {
  data: T;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Error response structure
 */
export interface APIErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
  };
}

/**
 * Resume optimization result
 */
export interface OptimizationResult {
  resume_id: string;
  optimized_sections: string[];
  changes_made: {
    section: string;
    before: unknown;
    after: unknown;
    reason: string;
  }[];
  suggestions: string[];
  metadata: {
    optimized_at: string;
    optimization_level: 'light' | 'moderate' | 'aggressive';
    ai_model_used: string;
  };
}

/**
 * Resume scoring result
 */
export interface ScoringResult {
  resume_id: string;
  overall_score: number;
  scores: {
    ats_compatibility?: number;
    keyword_match?: number;
    impact_assessment?: number;
    completeness?: number;
  };
  breakdown: {
    category: string;
    score: number;
    weight: number;
    feedback: string;
  }[];
  suggestions: string[];
  metadata: {
    scored_at: string;
    job_id?: string;
    ai_model_used: string;
  };
}

/**
 * Resume tailoring result
 */
export interface TailoringResult {
  new_resume_id: string;
  job_id: string;
  changes_summary: {
    sections_modified: string[];
    skills_added: string[];
    keywords_incorporated: string[];
    experience_reordered: boolean;
  };
  recommendations: string[];
  metadata: {
    tailored_at: string;
    source_resume_id: string;
    ai_model_used: string;
  };
}

/**
 * Cover letter generation result
 */
export interface CoverLetterResult {
  cover_letter_html: string;
  cover_letter_text: string;
  word_count: number;
  key_points: string[];
  metadata: {
    generated_at: string;
    resume_id: string;
    job_id: string;
    tone: string;
    ai_model_used: string;
  };
}

/**
 * Text improvement result
 */
export interface TextImprovementResult {
  original_text: string;
  improved_text: string;
  changes: {
    type: 'grammar' | 'clarity' | 'impact' | 'brevity' | 'ats';
    description: string;
    before: string;
    after: string;
  }[];
  score_improvement: number;
  metadata: {
    improved_at: string;
    context?: string;
    ai_model_used: string;
  };
}

/**
 * Optimization workflow result
 */
export interface OptimizationWorkflowResult {
  resume: unknown;
  score: unknown;
  iterations: number;
  target_achieved: boolean;
  optimization_history: {
    iteration: number;
    score: number;
    changes: string[];
    timestamp: string;
  }[];
}

/**
 * Optimization chat result
 */
export interface OptimizationChatResult {
  resume: unknown;
  message: string;
  changes_applied: {
    toolCallId: string;
    toolName: string;
    args: { description: string };
    state: 'result';
    result: { success: boolean; change: string };
  }[];
}

// ============================================================================
// Type Exports
// ============================================================================

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type CreateJobRequest = z.infer<typeof createJobRequestSchema>;
export type UpdateJobRequest = z.infer<typeof updateJobRequestSchema>;
export type GetJobsQuery = z.infer<typeof getJobsQuerySchema>;
export type CreateResumeRequest = z.infer<typeof createResumeRequestSchema>;
export type UpdateResumeRequest = z.infer<typeof updateResumeRequestSchema>;
export type GetResumesQuery = z.infer<typeof getResumesQuerySchema>;
export type TailorResumeRequest = z.infer<typeof tailorResumeRequestSchema>;
export type OptimizeResumeRequest = z.infer<typeof optimizeResumeRequestSchema>;
export type ScoreResumeRequest = z.infer<typeof scoreResumeRequestSchema>;
export type GenerateCoverLetterRequest = z.infer<typeof generateCoverLetterRequestSchema>;
export type ImproveTextRequest = z.infer<typeof improveTextRequestSchema>;
export type OptimizeWorkflowRequest = z.infer<typeof optimizeWorkflowRequestSchema>;
export type OptimizeChatRequest = z.infer<typeof optimizeChatRequestSchema>;
