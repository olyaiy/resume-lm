import { NextResponse } from 'next/server';

/**
 * GET /api/v1/docs
 * Returns OpenAPI 3.0 specification for the ResumeLM API
 */
export async function GET() {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3021';

  const openAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'ResumeLM API',
      version: '1.0.0',
      description: 'AI-powered resume builder and optimization platform API',
      contact: {
        name: 'ResumeLM Support',
        email: 'support@resumelm.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `${baseURL}/api/v1`,
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtained from /auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            user_metadata: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Resume: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            is_base_resume: { type: 'boolean' },
            target_role: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone_number: { type: 'string' },
            location: { type: 'string' },
            linkedin_url: { type: 'string', format: 'uri' },
            github_url: { type: 'string', format: 'uri' },
            work_experience: { type: 'array', items: { $ref: '#/components/schemas/WorkExperience' } },
            education: { type: 'array', items: { $ref: '#/components/schemas/Education' } },
            skills: { type: 'array', items: { $ref: '#/components/schemas/Skill' } },
            projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
            job_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        WorkExperience: {
          type: 'object',
          properties: {
            position: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string', nullable: true },
            description: { type: 'string' },
            responsibilities: { type: 'array', items: { type: 'string' } },
          },
          required: ['position', 'company', 'location', 'start_date', 'responsibilities'],
        },
        Education: {
          type: 'object',
          properties: {
            degree: { type: 'string' },
            institution: { type: 'string' },
            location: { type: 'string' },
            graduation_date: { type: 'string' },
            gpa: { type: 'string', nullable: true },
            achievements: { type: 'array', items: { type: 'string' } },
          },
          required: ['degree', 'institution', 'location', 'graduation_date'],
        },
        Skill: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
          },
          required: ['category', 'skills'],
        },
        Project: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
            url: { type: 'string', format: 'uri', nullable: true },
          },
          required: ['name', 'description', 'technologies'],
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            company_name: { type: 'string' },
            position_title: { type: 'string' },
            description: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
            responsibilities: { type: 'array', items: { type: 'string' } },
            work_location: { type: 'string', enum: ['remote', 'in_person', 'hybrid'] },
            employment_type: { type: 'string', enum: ['full_time', 'part_time', 'co_op', 'internship'] },
            salary_range: { type: 'string' },
            application_deadline: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
          required: ['company_name', 'position_title', 'description'],
        },
        ScoreResult: {
          type: 'object',
          properties: {
            overallScore: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 0, maximum: 100 },
                breakdown: {
                  type: 'object',
                  properties: {
                    completeness: { type: 'number' },
                    impactScore: { type: 'number' },
                    roleMatch: { type: 'number' },
                    jobAlignment: { type: 'number' },
                  },
                },
              },
            },
            completeness: { type: 'object' },
            impactScore: { type: 'object' },
            roleMatch: { type: 'object' },
            jobAlignment: { type: 'object' },
            overallImprovements: { type: 'array', items: { type: 'string' } },
            jobSpecificImprovements: { type: 'array', items: { type: 'string' } },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' },
                statusCode: { type: 'integer' },
                details: { type: 'object' },
              },
            },
          },
        },
        PaginationMetadata: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            total: { type: 'integer', minimum: 0 },
            totalPages: { type: 'integer', minimum: 0 },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          summary: 'Authenticate user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successfully authenticated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          session: {
                            type: 'object',
                            properties: {
                              access_token: { type: 'string' },
                              refresh_token: { type: 'string' },
                              expires_at: { type: 'integer' },
                              expires_in: { type: 'integer' },
                            },
                          },
                          access_token: { type: 'string' },
                          refresh_token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          summary: 'Logout current user',
          tags: ['Authentication'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Successfully logged out',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh access token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refresh_token'],
                  properties: {
                    refresh_token: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Token refreshed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          access_token: { type: 'string' },
                          refresh_token: { type: 'string' },
                          expires_at: { type: 'integer' },
                          expires_in: { type: 'integer' },
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get current user information',
          tags: ['Authentication'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'User information retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          profile: { type: 'object' },
                          subscription: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/resumes': {
        get: {
          summary: 'List resumes',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20, maximum: 100 },
            },
            {
              name: 'type',
              in: 'query',
              schema: { type: 'string', enum: ['base', 'tailored', 'all'], default: 'all' },
            },
          ],
          responses: {
            '200': {
              description: 'List of resumes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Resume' },
                      },
                      pagination: { $ref: '#/components/schemas/PaginationMetadata' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create new resume',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    importOption: { type: 'string', enum: ['import-profile', 'fresh', 'import-resume'] },
                    selectedContent: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Resume created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          resume: { $ref: '#/components/schemas/Resume' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/resumes/{id}': {
        get: {
          summary: 'Get resume by ID',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Resume retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          resume: { $ref: '#/components/schemas/Resume' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Resume not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        patch: {
          summary: 'Update resume',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    target_role: { type: 'string' },
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                    work_experience: { type: 'array', items: { $ref: '#/components/schemas/WorkExperience' } },
                    education: { type: 'array', items: { $ref: '#/components/schemas/Education' } },
                    skills: { type: 'array', items: { $ref: '#/components/schemas/Skill' } },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Resume updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          resume: { $ref: '#/components/schemas/Resume' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Delete resume',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Resume deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/resumes/{id}/score': {
        post: {
          summary: 'Score a resume',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    job_id: { type: 'string', format: 'uuid' },
                    config: {
                      type: 'object',
                      properties: {
                        model: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Resume scored',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/ScoreResult' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/resumes/tailor': {
        post: {
          summary: 'Tailor resume to job',
          tags: ['Resumes'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['base_resume_id', 'job_id'],
                  properties: {
                    base_resume_id: { type: 'string', format: 'uuid' },
                    job_id: { type: 'string', format: 'uuid' },
                    generate_score: { type: 'boolean', default: true },
                    config: {
                      type: 'object',
                      properties: {
                        model: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tailored resume created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          resume: { $ref: '#/components/schemas/Resume' },
                          score: { $ref: '#/components/schemas/ScoreResult' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/jobs': {
        get: {
          summary: 'List jobs',
          tags: ['Jobs'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10, maximum: 100 },
            },
            {
              name: 'workLocation',
              in: 'query',
              schema: { type: 'string', enum: ['remote', 'in_person', 'hybrid'] },
            },
            {
              name: 'employmentType',
              in: 'query',
              schema: { type: 'string', enum: ['full_time', 'part_time', 'co_op', 'internship'] },
            },
          ],
          responses: {
            '200': {
              description: 'List of jobs',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          jobs: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Job' },
                          },
                          totalCount: { type: 'integer' },
                          currentPage: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create job',
          tags: ['Jobs'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['company_name', 'position_title', 'description'],
                  properties: {
                    company_name: { type: 'string' },
                    position_title: { type: 'string' },
                    description: { type: 'string' },
                    requirements: { type: 'array', items: { type: 'string' } },
                    work_location: { type: 'string', enum: ['remote', 'in_person', 'hybrid'] },
                    employment_type: { type: 'string', enum: ['full_time', 'part_time', 'co_op', 'internship'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Job created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          job: { $ref: '#/components/schemas/Job' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/jobs/{id}': {
        get: {
          summary: 'Get job by ID',
          tags: ['Jobs'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Job retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          job: { $ref: '#/components/schemas/Job' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          summary: 'Update job',
          tags: ['Jobs'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    position_title: { type: 'string' },
                    description: { type: 'string' },
                    requirements: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Job updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          job: { $ref: '#/components/schemas/Job' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Delete job',
          tags: ['Jobs'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Job deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/optimize': {
        post: {
          summary: 'Automated resume optimization workflow',
          tags: ['Optimization'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['base_resume_id', 'job_id'],
                  properties: {
                    base_resume_id: { type: 'string', format: 'uuid' },
                    job_id: { type: 'string', format: 'uuid' },
                    target_score: { type: 'number', default: 85, minimum: 0, maximum: 100 },
                    max_iterations: { type: 'integer', default: 5, minimum: 1, maximum: 10 },
                    config: {
                      type: 'object',
                      properties: {
                        model: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Optimization complete',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          resume: { $ref: '#/components/schemas/Resume' },
                          score: { $ref: '#/components/schemas/ScoreResult' },
                          iterations: { type: 'integer' },
                          target_achieved: { type: 'boolean' },
                          optimization_history: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                iteration: { type: 'integer' },
                                score: { type: 'number' },
                                changes: { type: 'array', items: { type: 'string' } },
                                timestamp: { type: 'string', format: 'date-time' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/optimize/chat': {
        post: {
          summary: 'Interactive resume optimization',
          tags: ['Optimization'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['resume_id', 'message'],
                  properties: {
                    resume_id: { type: 'string', format: 'uuid' },
                    message: { type: 'string' },
                    job_id: { type: 'string', format: 'uuid' },
                    config: {
                      type: 'object',
                      properties: {
                        model: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Optimization applied',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          resume: { $ref: '#/components/schemas/Resume' },
                          message: { type: 'string' },
                          changes_applied: { type: 'array', items: { type: 'object' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/cover-letters': {
        post: {
          summary: 'Generate cover letter',
          tags: ['Cover Letters'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['resume_id', 'job_id'],
                  properties: {
                    resume_id: { type: 'string', format: 'uuid' },
                    job_id: { type: 'string', format: 'uuid' },
                    tone: { type: 'string', enum: ['professional', 'enthusiastic', 'creative', 'formal'], default: 'professional' },
                    length: { type: 'string', enum: ['short', 'medium', 'long'], default: 'medium' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Cover letter generated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          cover_letter: { type: 'string' },
                          metadata: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/profiles': {
        get: {
          summary: 'Get current user profile',
          tags: ['Profiles'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Profile retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          profile: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          summary: 'Update current user profile',
          tags: ['Profiles'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    location: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Profile updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          profile: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and session management' },
      { name: 'Resumes', description: 'Resume CRUD operations and scoring' },
      { name: 'Jobs', description: 'Job posting management' },
      { name: 'Profiles', description: 'User profile management' },
      { name: 'Optimization', description: 'AI-powered resume optimization' },
      { name: 'Cover Letters', description: 'Cover letter generation' },
    ],
  };

  return NextResponse.json(openAPISpec, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
