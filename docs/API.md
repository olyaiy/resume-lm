# ResumeLM API Documentation

Complete API reference for ResumeLM v1 - AI-powered resume builder and optimization platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Common Response Format](#common-response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Resumes](#resume-endpoints)
  - [Jobs](#job-endpoints)
  - [Profiles](#profile-endpoints)
  - [Cover Letters](#cover-letter-endpoints)
  - [Optimization](#optimization-endpoints)

---

## Overview

**Base URL**: `http://localhost:3021/api/v1` (development)

**Production Base URL**: `https://yourdomain.com/api/v1`

All API endpoints follow REST conventions and return JSON responses. The API uses JWT Bearer tokens for authentication.

### Key Features

- RESTful API design
- JWT authentication via Supabase
- Zod schema validation
- Comprehensive error handling
- AI-powered resume optimization
- Automated scoring and tailoring

---

## Authentication

All endpoints (except login) require authentication using JWT Bearer tokens.

### How to Authenticate

Include the access token in the `Authorization` header:

```
Authorization: Bearer <your_access_token>
```

### Obtaining Tokens

Use the `/auth/login` endpoint to obtain access and refresh tokens. Tokens expire after a set period and can be refreshed using the `/auth/refresh` endpoint.

---

## Common Response Format

### Success Response

```json
{
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Paginated Response

```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {
      // Additional error information
    }
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

Rate limits are enforced per user based on subscription plan:

- **Free Plan**: 10 requests/minute, 100 requests/hour
- **Pro Plan**: 60 requests/minute, 1000 requests/hour

Rate limit headers included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

When rate limited, API returns HTTP 429 with retry information.

---

## Endpoints

## Authentication Endpoints

### POST /auth/login

Authenticate user with email and password.

**Authentication**: None required

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200):

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "name": "John Doe"
      }
    },
    "session": {
      "access_token": "eyJhbGci...",
      "refresh_token": "refresh_token_here",
      "expires_at": 1640000000,
      "expires_in": 3600
    },
    "access_token": "eyJhbGci...",
    "refresh_token": "refresh_token_here"
  }
}
```

**Errors**:
- 401: Invalid credentials
- 400: Validation error

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

---

### POST /auth/logout

Logout current user and invalidate session.

**Authentication**: Required

**Response** (200):

```json
{
  "data": {
    "success": true,
    "message": "Successfully logged out"
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Authentication**: None required

**Request Body**:

```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response** (200):

```json
{
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token",
    "expires_at": 1640003600,
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

**Errors**:
- 401: Invalid or expired refresh token

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token"
  }'
```

---

### GET /auth/me

Get current authenticated user's information including profile and subscription.

**Authentication**: Required

**Response** (200):

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "location": "San Francisco, CA",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "work_experience": [],
      "education": [],
      "skills": [],
      "projects": []
    },
    "subscription": {
      "plan": "pro",
      "status": "active",
      "current_period_end": "2024-02-01T00:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl http://localhost:3021/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Resume Endpoints

### GET /resumes

List user's resumes with pagination and filtering.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| type | string | "all" | Filter: "base", "tailored", or "all" |

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Software Engineer Resume",
      "is_base_resume": true,
      "target_role": "Software Engineer",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "work_experience": [],
      "education": [],
      "skills": [],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**cURL Example**:

```bash
curl "http://localhost:3021/api/v1/resumes?type=base&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### POST /resumes

Create a new base resume.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "My Software Engineer Resume",
  "importOption": "import-profile",
  "selectedContent": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "location": "San Francisco, CA",
    "work_experience": [
      {
        "position": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "start_date": "2020-01",
        "end_date": "2024-01",
        "description": "Led development of key features",
        "responsibilities": [
          "Developed scalable microservices",
          "Mentored junior developers"
        ]
      }
    ],
    "education": [
      {
        "degree": "BS Computer Science",
        "institution": "University of California",
        "location": "Berkeley, CA",
        "graduation_date": "2020-05",
        "gpa": "3.8"
      }
    ],
    "skills": [
      {
        "category": "Programming",
        "skills": ["JavaScript", "TypeScript", "Python"]
      }
    ],
    "projects": []
  }
}
```

**Import Options**:
- `import-profile`: Import from user's profile
- `fresh`: Start with empty resume
- `import-resume`: Import from existing resume

**Response** (201):

```json
{
  "data": {
    "resume": {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Software Engineer Resume",
      "is_base_resume": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/resumes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Resume",
    "importOption": "import-profile"
  }'
```

---

### GET /resumes/:id

Get a specific resume by ID.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Resume UUID

**Response** (200):

```json
{
  "data": {
    "resume": {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Software Engineer Resume",
      "is_base_resume": true,
      "target_role": "Software Engineer",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "location": "San Francisco, CA",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "work_experience": [],
      "education": [],
      "skills": [],
      "projects": [],
      "job": null,
      "profile": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Errors**:
- 404: Resume not found or access denied

**cURL Example**:

```bash
curl http://localhost:3021/api/v1/resumes/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### PATCH /resumes/:id

Update a resume.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Resume UUID

**Request Body** (all fields optional):

```json
{
  "name": "Updated Resume Name",
  "target_role": "Senior Software Engineer",
  "first_name": "John",
  "last_name": "Doe",
  "work_experience": [
    {
      "position": "Senior Engineer",
      "company": "New Company",
      "location": "Remote",
      "start_date": "2024-01",
      "description": "Leading backend development",
      "responsibilities": [
        "Architected microservices",
        "Improved system performance by 40%"
      ]
    }
  ]
}
```

**Response** (200):

```json
{
  "data": {
    "resume": {
      "id": "uuid",
      "name": "Updated Resume Name",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl -X PATCH http://localhost:3021/api/v1/resumes/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Resume Name"
  }'
```

---

### DELETE /resumes/:id

Delete a resume.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Resume UUID

**Response** (200):

```json
{
  "data": {
    "success": true
  }
}
```

**Note**: Deleting a tailored resume also deletes its associated job.

**cURL Example**:

```bash
curl -X DELETE http://localhost:3021/api/v1/resumes/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### POST /resumes/:id/score

Generate AI-powered score for a resume.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Resume UUID

**Request Body** (optional):

```json
{
  "job_id": "uuid",
  "config": {
    "model": "gpt-4o",
    "apiKeys": ["custom-api-key"]
  }
}
```

**Response** (200):

```json
{
  "data": {
    "overallScore": {
      "score": 85,
      "breakdown": {
        "completeness": 40,
        "impactScore": 30,
        "roleMatch": 25,
        "jobAlignment": 30
      }
    },
    "completeness": {
      "contactInformation": {
        "score": 100,
        "reason": "All contact information present"
      },
      "detailLevel": {
        "score": 90,
        "reason": "Strong detail in work experience"
      }
    },
    "impactScore": {
      "activeVoiceUsage": {
        "score": 85,
        "reason": "Most bullets use active voice"
      },
      "quantifiedAchievements": {
        "score": 75,
        "reason": "Good use of metrics, can add more"
      }
    },
    "roleMatch": {
      "skillsRelevance": {
        "score": 90,
        "reason": "Skills highly relevant to target role"
      },
      "experienceAlignment": {
        "score": 85,
        "reason": "Experience aligns well with role"
      },
      "educationFit": {
        "score": 100,
        "reason": "Education meets requirements"
      }
    },
    "overallImprovements": [
      "Add more quantified achievements",
      "Use stronger action verbs"
    ]
  }
}
```

**Score Breakdown**:
- **Completeness** (40 points): Contact info, detail level
- **Impact Score** (30 points): Active voice, quantified achievements
- **Role Match** (25 points): Skills relevance, experience alignment, education
- **Job Alignment** (30 points, if job provided): Keyword match, requirements match, company fit

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/resumes/RESUME_ID/score \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB_ID"
  }'
```

---

### POST /resumes/tailor

Create a tailored resume from a base resume for a specific job.

**Authentication**: Required

**Request Body**:

```json
{
  "base_resume_id": "uuid",
  "job_id": "uuid",
  "generate_score": true,
  "config": {
    "model": "gpt-4o"
  }
}
```

**Response** (200):

```json
{
  "data": {
    "resume": {
      "id": "uuid",
      "name": "Tailored Resume - Software Engineer at Tech Corp",
      "is_base_resume": false,
      "job_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "score": {
      "overallScore": {
        "score": 88
      }
    }
  }
}
```

**Process**:
1. Fetches base resume and job description
2. Uses AI to tailor resume content to job
3. Creates new tailored resume in database
4. Optionally generates score

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/resumes/tailor \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "base_resume_id": "BASE_RESUME_ID",
    "job_id": "JOB_ID",
    "generate_score": true
  }'
```

---

## Job Endpoints

### GET /jobs

List user's jobs with pagination and filtering.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page (max 100) |
| workLocation | string | - | Filter: "remote", "in_person", "hybrid" |
| employmentType | string | - | Filter: "full_time", "part_time", "co_op", "internship" |
| keywords[] | string[] | - | Filter by keywords |

**Response** (200):

```json
{
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "company_name": "Tech Corp",
        "position_title": "Senior Software Engineer",
        "description": "We are looking for...",
        "requirements": ["5+ years experience", "TypeScript"],
        "work_location": "remote",
        "employment_type": "full_time",
        "salary_range": "$150k - $200k",
        "application_deadline": "2024-02-01",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "totalCount": 15,
    "currentPage": 1,
    "totalPages": 2
  }
}
```

**cURL Example**:

```bash
curl "http://localhost:3021/api/v1/jobs?workLocation=remote&page=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### POST /jobs

Create a new job posting.

**Authentication**: Required

**Request Body**:

```json
{
  "company_name": "Tech Corp",
  "position_title": "Senior Software Engineer",
  "description": "We are seeking a talented Senior Software Engineer...",
  "requirements": [
    "5+ years of experience",
    "Strong TypeScript skills",
    "Experience with React"
  ],
  "responsibilities": [
    "Lead development of new features",
    "Mentor junior developers"
  ],
  "work_location": "remote",
  "employment_type": "full_time",
  "salary_range": "$150k - $200k",
  "application_deadline": "2024-02-01",
  "company_culture": "Fast-paced startup environment",
  "benefits": ["Health insurance", "401k", "Remote work"]
}
```

**Response** (201):

```json
{
  "data": {
    "job": {
      "id": "uuid",
      "company_name": "Tech Corp",
      "position_title": "Senior Software Engineer",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Corp",
    "position_title": "Software Engineer",
    "description": "Job description here"
  }'
```

---

### GET /jobs/:id

Get a specific job by ID.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Job UUID

**Response** (200):

```json
{
  "data": {
    "job": {
      "id": "uuid",
      "user_id": "uuid",
      "company_name": "Tech Corp",
      "position_title": "Senior Software Engineer",
      "description": "Full job description...",
      "requirements": [],
      "responsibilities": [],
      "work_location": "remote",
      "employment_type": "full_time",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Errors**:
- 404: Job not found or access denied

**cURL Example**:

```bash
curl http://localhost:3021/api/v1/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### PATCH /jobs/:id

Update a job.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Job UUID

**Request Body** (all fields optional):

```json
{
  "position_title": "Staff Software Engineer",
  "salary_range": "$180k - $220k",
  "description": "Updated description"
}
```

**Response** (200):

```json
{
  "data": {
    "job": {
      "id": "uuid",
      "position_title": "Staff Software Engineer",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl -X PATCH http://localhost:3021/api/v1/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position_title": "Staff Software Engineer"
  }'
```

---

### DELETE /jobs/:id

Delete a job.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Job UUID

**Response** (200):

```json
{
  "data": {
    "success": true
  }
}
```

**Note**: Cascade deletes associated tailored resumes.

**cURL Example**:

```bash
curl -X DELETE http://localhost:3021/api/v1/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Profile Endpoints

### GET /profiles

Get current user's profile.

**Authentication**: Required

**Response** (200):

```json
{
  "data": {
    "profile": {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "work_experience": [],
      "education": [],
      "skills": [],
      "projects": [],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl http://localhost:3021/api/v1/profiles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### PATCH /profiles

Update current user's profile.

**Authentication**: Required

**Request Body** (all fields optional):

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "location": "New York, NY",
  "work_experience": [
    {
      "position": "Software Engineer",
      "company": "New Corp",
      "location": "Remote",
      "start_date": "2024-01",
      "responsibilities": [
        "Built scalable systems"
      ]
    }
  ]
}
```

**Response** (200):

```json
{
  "data": {
    "profile": {
      "id": "uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl -X PATCH http://localhost:3021/api/v1/profiles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane"
  }'
```

---

### GET /profiles/:id

Get any user's profile by ID (Admin only).

**Authentication**: Required (Admin role)

**URL Parameters**:
- `id` (string, required): User UUID

**Response** (200):

```json
{
  "data": {
    "profile": {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

**Errors**:
- 403: Forbidden - Admin access required
- 404: Profile not found

**cURL Example**:

```bash
curl http://localhost:3021/api/v1/profiles/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Cover Letter Endpoints

### POST /cover-letters

Generate a cover letter for a job application.

**Authentication**: Required

**Request Body**:

```json
{
  "resume_id": "uuid",
  "job_id": "uuid",
  "tone": "professional",
  "length": "medium"
}
```

**Tone Options**:
- `professional` (default)
- `enthusiastic`
- `creative`
- `formal`

**Length Options**:
- `short` (~200 words)
- `medium` (~400 words, default)
- `long` (~600 words)

**Response** (200):

```json
{
  "data": {
    "cover_letter": "Dear Hiring Manager,\n\nI am writing to express...",
    "metadata": {
      "resume_id": "uuid",
      "job_id": "uuid",
      "tone": "professional",
      "length": "medium",
      "generated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/cover-letters \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "RESUME_ID",
    "job_id": "JOB_ID",
    "tone": "professional",
    "length": "medium"
  }'
```

---

### GET /cover-letters/:id

Get saved cover letter for a resume.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Resume UUID

**Response** (200):

```json
{
  "data": {
    "cover_letter": {
      "content": "Dear Hiring Manager...",
      "metadata": {
        "tone": "professional",
        "length": "medium"
      }
    },
    "resume_id": "uuid"
  }
}
```

**Errors**:
- 404: Resume not found or no cover letter exists

**cURL Example**:

```bash
curl http://localhost:3021/api/v1/cover-letters/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### DELETE /cover-letters/:id

Delete cover letter from a resume.

**Authentication**: Required

**URL Parameters**:
- `id` (string, required): Resume UUID

**Response** (200):

```json
{
  "data": {
    "success": true
  }
}
```

**cURL Example**:

```bash
curl -X DELETE http://localhost:3021/api/v1/cover-letters/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Optimization Endpoints

### POST /optimize

Automated iterative resume optimization workflow.

**Authentication**: Required

**Request Body**:

```json
{
  "base_resume_id": "uuid",
  "job_id": "uuid",
  "target_score": 85,
  "max_iterations": 5,
  "config": {
    "model": "gpt-4o",
    "apiKeys": []
  }
}
```

**Parameters**:
- `base_resume_id` (required): Base resume to optimize
- `job_id` (required): Target job
- `target_score` (optional, default: 85): Target score to achieve
- `max_iterations` (optional, default: 5): Maximum optimization iterations
- `config` (optional): AI configuration

**Response** (200):

```json
{
  "data": {
    "resume": {
      "id": "uuid",
      "name": "Optimized Resume",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "score": {
      "overallScore": {
        "score": 88
      }
    },
    "iterations": 3,
    "target_achieved": true,
    "optimization_history": [
      {
        "iteration": 1,
        "score": 75,
        "changes": [
          "Added quantified achievements",
          "Improved action verbs"
        ],
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "iteration": 2,
        "score": 82,
        "changes": [
          "Incorporated missing keywords",
          "Enhanced skills section"
        ],
        "timestamp": "2024-01-01T00:01:00Z"
      },
      {
        "iteration": 3,
        "score": 88,
        "changes": [
          "Target score achieved"
        ],
        "timestamp": "2024-01-01T00:02:00Z"
      }
    ]
  }
}
```

**Workflow**:
1. Creates initial tailored resume from base resume
2. Iteratively scores and optimizes until target achieved or max iterations reached
3. Each iteration:
   - Scores current resume
   - Identifies weak areas (score < 80)
   - Uses AI to optimize those areas
   - Updates resume
   - Tracks changes
4. Returns final resume with complete optimization history

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/optimize \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "base_resume_id": "BASE_RESUME_ID",
    "job_id": "JOB_ID",
    "target_score": 85,
    "max_iterations": 5
  }'
```

---

### POST /optimize/chat

Interactive resume optimization via natural language.

**Authentication**: Required

**Request Body**:

```json
{
  "resume_id": "uuid",
  "message": "Add more quantified achievements to my work experience",
  "job_id": "uuid",
  "config": {
    "model": "gpt-4o"
  }
}
```

**Parameters**:
- `resume_id` (required): Resume to optimize
- `message` (required): Natural language instruction
- `job_id` (optional): Context for job-specific optimization
- `config` (optional): AI configuration

**Response** (200):

```json
{
  "data": {
    "resume": {
      "id": "uuid",
      "work_experience": [
        {
          "position": "Software Engineer",
          "responsibilities": [
            "Increased system performance by 40% through optimization",
            "Reduced deployment time from 2 hours to 15 minutes",
            "Led team of 5 engineers to deliver 3 major features"
          ]
        }
      ],
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "message": "I've enhanced your work experience bullets with quantified achievements, adding specific metrics and percentages to demonstrate impact.",
    "changes_applied": [
      {
        "toolCallId": "call_1",
        "toolName": "update_resume",
        "args": {
          "description": "Added quantified achievements"
        },
        "state": "result",
        "result": {
          "success": true,
          "change": "Enhanced 3 work experience bullets with metrics"
        }
      }
    ]
  }
}
```

**Example Messages**:
- "Make my resume more ATS-friendly"
- "Add missing keywords from the job description"
- "Improve the impact of my bullets"
- "Make my summary more compelling"
- "Reorder my experience to highlight relevant skills"

**cURL Example**:

```bash
curl -X POST http://localhost:3021/api/v1/optimize/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "RESUME_ID",
    "message": "Add more quantified achievements",
    "job_id": "JOB_ID"
  }'
```

---

## Best Practices

### Security

1. **Never expose tokens**: Store access tokens securely, never in version control
2. **Use HTTPS**: Always use HTTPS in production
3. **Token rotation**: Refresh tokens before expiry
4. **Validate input**: All inputs are validated server-side

### Performance

1. **Pagination**: Always use pagination for list endpoints
2. **Caching**: Implement client-side caching for profile/resume data
3. **Batch operations**: Group related API calls when possible
4. **Rate limiting**: Respect rate limits, implement exponential backoff

### AI Operations

1. **Configuration**: Provide AI config for model selection
2. **Iterative optimization**: Use target_score and max_iterations wisely
3. **Natural language**: Use clear, specific instructions in chat optimization
4. **Context**: Include job_id for better job-specific optimizations

### Error Handling

1. **Check status codes**: Always check HTTP status codes
2. **Parse error details**: Error responses include detailed information
3. **Retry logic**: Implement retry logic for 5xx errors
4. **User feedback**: Display meaningful error messages to users

---

## Changelog

### v1.0.0 (2024-01-01)

- Initial API release
- Authentication endpoints
- Resume CRUD operations
- Job management
- Profile management
- Cover letter generation
- Optimization workflow
- Interactive chat optimization

---

## Support

For API support, please contact:
- Email: support@resumelm.com
- Documentation: https://docs.resumelm.com
- GitHub Issues: https://github.com/resumelm/issues
