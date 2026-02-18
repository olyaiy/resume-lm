/**
 * ResumeLM API Usage Examples
 *
 * This file demonstrates how to interact with the ResumeLM API
 * using TypeScript with proper type safety and error handling.
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface APIResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
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

interface APIError {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
  };
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

interface Resume {
  id: string;
  user_id: string;
  name: string;
  is_base_resume: boolean;
  target_role?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  work_experience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  job_id?: string;
  created_at: string;
  updated_at: string;
}

interface WorkExperience {
  position: string;
  company: string;
  location: string;
  start_date: string;
  end_date?: string;
  description?: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  graduation_date: string;
  gpa?: string;
  achievements?: string[];
}

interface Skill {
  category: string;
  skills: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

interface Job {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  work_location?: 'remote' | 'in_person' | 'hybrid';
  employment_type?: 'full_time' | 'part_time' | 'co_op' | 'internship';
  salary_range?: string;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
}

interface ScoreResult {
  overallScore: {
    score: number;
    breakdown: {
      completeness: number;
      impactScore: number;
      roleMatch: number;
      jobAlignment?: number;
    };
  };
  completeness: {
    contactInformation: { score: number; reason: string };
    detailLevel: { score: number; reason: string };
  };
  impactScore: {
    activeVoiceUsage: { score: number; reason: string };
    quantifiedAchievements: { score: number; reason: string };
  };
  roleMatch: {
    skillsRelevance: { score: number; reason: string };
    experienceAlignment: { score: number; reason: string };
    educationFit: { score: number; reason: string };
  };
  jobAlignment?: {
    keywordMatch: { score: number; reason: string; missingKeywords?: string[] };
    requirementsMatch: { score: number; reason: string; gapAnalysis?: string[] };
    companyFit: { score: number; reason: string };
  };
  overallImprovements?: string[];
  jobSpecificImprovements?: string[];
}

// ============================================================================
// API Client Class
// ============================================================================

class ResumeLMClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = 'http://localhost:3021/api/v1') {
    this.baseURL = baseURL;
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as APIError;
      throw new Error(
        `API Error (${error.error.statusCode}): ${error.error.message}`
      );
    }

    return data;
  }

  // ==========================================================================
  // Authentication Methods
  // ==========================================================================

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{
    user: User;
    session: AuthSession;
  }> {
    const response = await this.request<APIResponse<{
      user: User;
      session: AuthSession;
      access_token: string;
      refresh_token: string;
    }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setTokens(response.data.access_token, response.data.refresh_token);

    return {
      user: response.data.user,
      session: response.data.session,
    };
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.request<APIResponse<{ success: boolean }>>('/auth/logout', {
      method: 'POST',
    });

    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Refresh access token
   */
  async refresh(): Promise<AuthSession> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<APIResponse<AuthSession & { user: User }>>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      }
    );

    this.setTokens(response.data.access_token, response.data.refresh_token);

    return response.data;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<{
    user: User;
    profile: any;
    subscription: any;
  }> {
    const response = await this.request<APIResponse<{
      user: User;
      profile: any;
      subscription: any;
    }>>('/auth/me');

    return response.data;
  }

  // ==========================================================================
  // Resume Methods
  // ==========================================================================

  /**
   * List resumes with pagination
   */
  async listResumes(params?: {
    page?: number;
    limit?: number;
    type?: 'base' | 'tailored' | 'all';
  }): Promise<PaginatedResponse<Resume>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);

    return this.request<PaginatedResponse<Resume>>(
      `/resumes?${searchParams.toString()}`
    );
  }

  /**
   * Create a new base resume
   */
  async createResume(data: {
    name: string;
    importOption?: 'import-profile' | 'fresh' | 'import-resume';
    selectedContent?: Partial<Resume>;
  }): Promise<Resume> {
    const response = await this.request<APIResponse<{ resume: Resume }>>(
      '/resumes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response.data.resume;
  }

  /**
   * Get resume by ID
   */
  async getResume(id: string): Promise<Resume> {
    const response = await this.request<APIResponse<{ resume: Resume }>>(
      `/resumes/${id}`
    );

    return response.data.resume;
  }

  /**
   * Update resume
   */
  async updateResume(id: string, data: Partial<Resume>): Promise<Resume> {
    const response = await this.request<APIResponse<{ resume: Resume }>>(
      `/resumes/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    return response.data.resume;
  }

  /**
   * Delete resume
   */
  async deleteResume(id: string): Promise<void> {
    await this.request<APIResponse<{ success: boolean }>>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Score a resume
   */
  async scoreResume(
    resumeId: string,
    jobId?: string,
    config?: { model?: string }
  ): Promise<ScoreResult> {
    const response = await this.request<APIResponse<ScoreResult>>(
      `/resumes/${resumeId}/score`,
      {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId, config }),
      }
    );

    return response.data;
  }

  /**
   * Tailor resume to job
   */
  async tailorResume(
    baseResumeId: string,
    jobId: string,
    generateScore: boolean = true,
    config?: { model?: string }
  ): Promise<{ resume: Resume; score?: ScoreResult }> {
    const response = await this.request<APIResponse<{
      resume: Resume;
      score?: ScoreResult;
    }>>('/resumes/tailor', {
      method: 'POST',
      body: JSON.stringify({
        base_resume_id: baseResumeId,
        job_id: jobId,
        generate_score: generateScore,
        config,
      }),
    });

    return response.data;
  }

  // ==========================================================================
  // Job Methods
  // ==========================================================================

  /**
   * List jobs with pagination
   */
  async listJobs(params?: {
    page?: number;
    limit?: number;
    workLocation?: 'remote' | 'in_person' | 'hybrid';
    employmentType?: 'full_time' | 'part_time' | 'co_op' | 'internship';
    keywords?: string[];
  }): Promise<{
    jobs: Job[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.workLocation) searchParams.set('workLocation', params.workLocation);
    if (params?.employmentType) searchParams.set('employmentType', params.employmentType);
    if (params?.keywords) {
      params.keywords.forEach((kw) => searchParams.append('keywords[]', kw));
    }

    const response = await this.request<APIResponse<{
      jobs: Job[];
      totalCount: number;
      currentPage: number;
      totalPages: number;
    }>>(`/jobs?${searchParams.toString()}`);

    return response.data;
  }

  /**
   * Create a new job
   */
  async createJob(data: Partial<Job>): Promise<Job> {
    const response = await this.request<APIResponse<{ job: Job }>>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data.job;
  }

  /**
   * Get job by ID
   */
  async getJob(id: string): Promise<Job> {
    const response = await this.request<APIResponse<{ job: Job }>>(`/jobs/${id}`);
    return response.data.job;
  }

  /**
   * Update job
   */
  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const response = await this.request<APIResponse<{ job: Job }>>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return response.data.job;
  }

  /**
   * Delete job
   */
  async deleteJob(id: string): Promise<void> {
    await this.request<APIResponse<{ success: boolean }>>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Optimization Methods
  // ==========================================================================

  /**
   * Optimize resume with automated workflow
   */
  async optimizeResume(params: {
    baseResumeId: string;
    jobId: string;
    targetScore?: number;
    maxIterations?: number;
    config?: { model?: string; apiKeys?: string[] };
  }): Promise<{
    resume: Resume;
    score: ScoreResult;
    iterations: number;
    target_achieved: boolean;
    optimization_history: Array<{
      iteration: number;
      score: number;
      changes: string[];
      timestamp: string;
    }>;
  }> {
    const response = await this.request<APIResponse<{
      resume: Resume;
      score: ScoreResult;
      iterations: number;
      target_achieved: boolean;
      optimization_history: Array<{
        iteration: number;
        score: number;
        changes: string[];
        timestamp: string;
      }>;
    }>>('/optimize', {
      method: 'POST',
      body: JSON.stringify({
        base_resume_id: params.baseResumeId,
        job_id: params.jobId,
        target_score: params.targetScore ?? 85,
        max_iterations: params.maxIterations ?? 5,
        config: params.config,
      }),
    });

    return response.data;
  }

  /**
   * Interactive resume optimization via chat
   */
  async optimizeChat(params: {
    resumeId: string;
    message: string;
    jobId?: string;
    config?: { model?: string };
  }): Promise<{
    resume: Resume;
    message: string;
    changes_applied: Array<{
      toolCallId: string;
      toolName: string;
      args: { description: string };
      state: string;
      result: { success: boolean; change: string };
    }>;
  }> {
    const response = await this.request<APIResponse<{
      resume: Resume;
      message: string;
      changes_applied: any[];
    }>>('/optimize/chat', {
      method: 'POST',
      body: JSON.stringify({
        resume_id: params.resumeId,
        message: params.message,
        job_id: params.jobId,
        config: params.config,
      }),
    });

    return response.data;
  }

  // ==========================================================================
  // Cover Letter Methods
  // ==========================================================================

  /**
   * Generate cover letter
   */
  async generateCoverLetter(params: {
    resumeId: string;
    jobId: string;
    tone?: 'professional' | 'enthusiastic' | 'creative' | 'formal';
    length?: 'short' | 'medium' | 'long';
  }): Promise<{
    cover_letter: string;
    metadata: {
      resume_id: string;
      job_id: string;
      tone: string;
      length: string;
      generated_at: string;
    };
  }> {
    const response = await this.request<APIResponse<{
      cover_letter: string;
      metadata: any;
    }>>('/cover-letters', {
      method: 'POST',
      body: JSON.stringify({
        resume_id: params.resumeId,
        job_id: params.jobId,
        tone: params.tone ?? 'professional',
        length: params.length ?? 'medium',
      }),
    });

    return response.data;
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Complete Authentication Flow
 */
async function exampleAuthFlow() {
  const client = new ResumeLMClient();

  try {
    // Login
    const { user, session } = await client.login(
      'user@example.com',
      'SecurePassword123'
    );
    console.log('Logged in:', user.email);
    console.log('Token expires at:', new Date(session.expires_at * 1000));

    // Get current user info
    const userInfo = await client.getCurrentUser();
    console.log('Profile:', userInfo.profile);
    console.log('Subscription:', userInfo.subscription);

    // Refresh token before expiry
    const newSession = await client.refresh();
    console.log('Token refreshed, new expiry:', new Date(newSession.expires_at * 1000));

    // Logout
    await client.logout();
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Auth error:', error);
  }
}

/**
 * Example 2: Create and Manage Resumes
 */
async function exampleResumeManagement() {
  const client = new ResumeLMClient();
  await client.login('user@example.com', 'password');

  try {
    // Create base resume
    const resume = await client.createResume({
      name: 'Software Engineer Resume',
      importOption: 'import-profile',
    });
    console.log('Created resume:', resume.id);

    // Update resume
    const updated = await client.updateResume(resume.id, {
      target_role: 'Senior Software Engineer',
      work_experience: [
        {
          position: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          start_date: '2020-01',
          end_date: '2024-01',
          responsibilities: [
            'Developed scalable microservices serving 1M+ users',
            'Led team of 5 engineers to deliver 3 major features',
            'Improved system performance by 40% through optimization',
          ],
        },
      ],
    });
    console.log('Updated resume:', updated.name);

    // List all resumes
    const resumes = await client.listResumes({ type: 'base', limit: 10 });
    console.log(`Found ${resumes.pagination.total} base resumes`);

    // Delete resume
    await client.deleteResume(resume.id);
    console.log('Deleted resume');
  } catch (error) {
    console.error('Resume management error:', error);
  }
}

/**
 * Example 3: Job-Specific Resume Tailoring
 */
async function exampleResumeTailoring() {
  const client = new ResumeLMClient();
  await client.login('user@example.com', 'password');

  try {
    // Create job posting
    const job = await client.createJob({
      company_name: 'Tech Corp',
      position_title: 'Senior Software Engineer',
      description: 'We are seeking a talented engineer...',
      requirements: [
        '5+ years of experience',
        'Strong TypeScript and React skills',
        'Experience with microservices',
      ],
      work_location: 'remote',
      employment_type: 'full_time',
      salary_range: '$150k - $200k',
    });
    console.log('Created job:', job.id);

    // Get base resume
    const resumes = await client.listResumes({ type: 'base', limit: 1 });
    const baseResume = resumes.data[0];

    // Tailor resume to job
    const { resume: tailored, score } = await client.tailorResume(
      baseResume.id,
      job.id,
      true
    );
    console.log('Tailored resume created:', tailored.id);
    console.log('Initial score:', score?.overallScore.score);

    // Score the tailored resume
    const detailedScore = await client.scoreResume(tailored.id, job.id);
    console.log('Score breakdown:', detailedScore.overallScore.breakdown);
    console.log('Improvements:', detailedScore.overallImprovements);
  } catch (error) {
    console.error('Tailoring error:', error);
  }
}

/**
 * Example 4: Automated Resume Optimization
 */
async function exampleOptimization() {
  const client = new ResumeLMClient();
  await client.login('user@example.com', 'password');

  try {
    // Get base resume and job
    const resumes = await client.listResumes({ type: 'base', limit: 1 });
    const baseResume = resumes.data[0];

    const jobs = await client.listJobs({ limit: 1 });
    const job = jobs.jobs[0];

    // Run optimization workflow
    console.log('Starting optimization...');
    const result = await client.optimizeResume({
      baseResumeId: baseResume.id,
      jobId: job.id,
      targetScore: 85,
      maxIterations: 5,
      config: { model: 'gpt-4o' },
    });

    console.log('Optimization complete!');
    console.log('Final score:', result.score.overallScore.score);
    console.log('Iterations:', result.iterations);
    console.log('Target achieved:', result.target_achieved);

    // Print optimization history
    result.optimization_history.forEach((iteration) => {
      console.log(`\nIteration ${iteration.iteration} (Score: ${iteration.score}):`);
      iteration.changes.forEach((change) => console.log(`  - ${change}`));
    });
  } catch (error) {
    console.error('Optimization error:', error);
  }
}

/**
 * Example 5: Interactive Resume Optimization
 */
async function exampleInteractiveOptimization() {
  const client = new ResumeLMClient();
  await client.login('user@example.com', 'password');

  try {
    // Get a resume
    const resumes = await client.listResumes({ type: 'base', limit: 1 });
    const resume = resumes.data[0];

    // Interactive optimization requests
    const messages = [
      'Add more quantified achievements to my work experience',
      'Make the bullets more concise',
      'Emphasize my leadership experience',
      'Add missing keywords: Kubernetes, Docker, CI/CD',
    ];

    for (const message of messages) {
      console.log(`\nRequest: ${message}`);
      const result = await client.optimizeChat({
        resumeId: resume.id,
        message,
      });

      console.log('AI Response:', result.message);
      console.log('Changes applied:');
      result.changes_applied.forEach((change) => {
        console.log(`  - ${change.result.change}`);
      });
    }
  } catch (error) {
    console.error('Interactive optimization error:', error);
  }
}

/**
 * Example 6: Cover Letter Generation
 */
async function exampleCoverLetter() {
  const client = new ResumeLMClient();
  await client.login('user@example.com', 'password');

  try {
    // Get resume and job
    const resumes = await client.listResumes({ limit: 1 });
    const resume = resumes.data[0];

    const jobs = await client.listJobs({ limit: 1 });
    const job = jobs.jobs[0];

    // Generate cover letter
    const result = await client.generateCoverLetter({
      resumeId: resume.id,
      jobId: job.id,
      tone: 'professional',
      length: 'medium',
    });

    console.log('Cover Letter Generated:');
    console.log(result.cover_letter);
    console.log('\nMetadata:', result.metadata);
  } catch (error) {
    console.error('Cover letter error:', error);
  }
}

/**
 * Example 7: Complete Job Application Workflow
 */
async function exampleCompleteWorkflow() {
  const client = new ResumeLMClient();

  try {
    // 1. Login
    await client.login('user@example.com', 'password');
    console.log('✓ Logged in');

    // 2. Create base resume (if needed)
    const baseResume = await client.createResume({
      name: 'My Base Resume',
      importOption: 'import-profile',
    });
    console.log('✓ Base resume created');

    // 3. Create job posting
    const job = await client.createJob({
      company_name: 'Dream Company',
      position_title: 'Senior Engineer',
      description: 'Amazing opportunity...',
      requirements: ['5+ years experience', 'TypeScript', 'React'],
    });
    console.log('✓ Job created');

    // 4. Optimize resume for job
    const optimization = await client.optimizeResume({
      baseResumeId: baseResume.id,
      jobId: job.id,
      targetScore: 85,
      maxIterations: 5,
    });
    console.log(`✓ Resume optimized (Score: ${optimization.score.overallScore.score})`);

    // 5. Generate cover letter
    const coverLetter = await client.generateCoverLetter({
      resumeId: optimization.resume.id,
      jobId: job.id,
      tone: 'professional',
      length: 'medium',
    });
    console.log('✓ Cover letter generated');

    // 6. Review final materials
    console.log('\n=== Application Materials Ready ===');
    console.log('Resume ID:', optimization.resume.id);
    console.log('Resume Score:', optimization.score.overallScore.score);
    console.log('Optimization Iterations:', optimization.iterations);
    console.log('Cover Letter Length:', coverLetter.cover_letter.length, 'chars');

    console.log('\n✓ Application package complete!');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

/**
 * Example 8: Error Handling
 */
async function exampleErrorHandling() {
  const client = new ResumeLMClient();

  try {
    // Attempt to access protected endpoint without auth
    await client.listResumes();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('Authentication required - redirecting to login');
        // Handle auth error
      } else if (error.message.includes('404')) {
        console.log('Resource not found');
        // Handle not found
      } else if (error.message.includes('429')) {
        console.log('Rate limit exceeded - waiting before retry');
        // Implement exponential backoff
      } else {
        console.log('Unexpected error:', error.message);
        // Handle other errors
      }
    }
  }
}

// ============================================================================
// Export for use in other files
// ============================================================================

export { ResumeLMClient };
export type {
  APIResponse,
  PaginatedResponse,
  APIError,
  User,
  Resume,
  Job,
  ScoreResult,
  WorkExperience,
  Education,
  Skill,
  Project,
};

// Run examples (comment out in production)
if (require.main === module) {
  console.log('ResumeLM API Usage Examples\n');

  // Uncomment to run specific examples:
  // exampleAuthFlow();
  // exampleResumeManagement();
  // exampleResumeTailoring();
  // exampleOptimization();
  // exampleInteractiveOptimization();
  // exampleCoverLetter();
  // exampleCompleteWorkflow();
  // exampleErrorHandling();
}
