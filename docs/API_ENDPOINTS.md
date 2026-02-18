# ResumeLM API Endpoints Reference

Complete endpoint documentation for ResumeLM v1 REST API - AI-powered resume builder and optimization platform.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [Common Response Format](#common-response-format)
- [HTTP Status Codes](#http-status-codes)
- [Endpoints by Category](#endpoints-by-category)
  - [Authentication (4 endpoints)](#authentication-endpoints)
  - [Resumes (7 endpoints)](#resume-endpoints)
  - [Jobs (5 endpoints)](#job-endpoints)
  - [Profiles (3 endpoints)](#profile-endpoints)
  - [Cover Letters (3 endpoints)](#cover-letter-endpoints)
  - [Optimization (2 endpoints)](#optimization-endpoints)
  - [Utility (2 endpoints)](#utility-endpoints)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Overview

**Base URL (Development):** `http://localhost:3021/api/v1`

**Base URL (Production):** `https://yourdomain.com/api/v1`

**API Version:** v1

**Authentication:** JWT Bearer tokens via Supabase Auth

**Content Type:** `application/json`

### Key Features

- RESTful design with standard HTTP methods
- JWT-based authentication
- Zod schema validation for all inputs
- Comprehensive error messages
- AI-powered resume optimization
- Paginated list endpoints
- Rate limiting per subscription tier

---

## Authentication Flow

All endpoints (except login, refresh, and health) require a valid JWT access token.

### How to Authenticate

1. **Login** to obtain access and refresh tokens
2. **Include token** in Authorization header for all requests:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
3. **Refresh token** when it expires using the refresh endpoint

### Token Lifecycle

- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Use `/auth/refresh` to get new access tokens without re-login
- Tokens are invalidated on logout

---

## Common Response Format

### Success Response

All successful responses follow this structure:

```json
{
  "data": {
    // Response payload
  },
  "message": "Optional success message"
}
```

### Paginated Response

List endpoints return paginated data:

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

## HTTP Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST creating new resource |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing/invalid token, login failed |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist or access denied |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error (contact support) |
| 503 | Service Unavailable | Temporary service outage |

---

## Endpoints by Category

### Authentication Endpoints

#### 1. POST /api/v1/auth/login

Authenticate user with email and password.

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "user_metadata": {
        "name": "John Doe"
      }
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.refresh_token_here",
      "expires_at": 1640003600,
      "expires_in": 3600
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.refresh_token_here"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password
- `400 Bad Request`: Missing or invalid email format

**cURL Example:**
```bash
curl -X POST http://localhost:3021/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123',
  }),
});

const { data } = await response.json();
const accessToken = data.access_token;
```

**Notes:**
- Store access token securely (never in localStorage for sensitive apps)
- Store refresh token for token renewal
- Access tokens expire in 1 hour

---

#### 2. POST /api/v1/auth/logout

Logout current user and invalidate session.

**Authentication Required:** Yes

**Request Body:** None

**Success Response (200):**
```json
{
  "data": {
    "success": true,
    "message": "Successfully logged out"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

**cURL Example:**
```bash
curl -X POST http://localhost:3021/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

**Notes:**
- Invalidates the current session
- Clear stored tokens after logout
- User must login again to access protected endpoints

---

#### 3. POST /api/v1/auth/refresh

Refresh access token using refresh token.

**Authentication Required:** No (uses refresh token)

**Request Body:**
```json
{
  "refresh_token": "v1.refresh_token_here"
}
```

**Success Response (200):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.new_refresh_token_here",
    "expires_at": 1640003600,
    "expires_in": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token

**cURL Example:**
```bash
curl -X POST http://localhost:3021/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "v1.refresh_token_here"
  }'
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refresh_token: storedRefreshToken,
  }),
});

const { data } = await response.json();
// Update stored tokens
const newAccessToken = data.access_token;
const newRefreshToken = data.refresh_token;
```

**Notes:**
- Refresh tokens before they expire (implement auto-refresh)
- New refresh token is issued with each refresh
- Update both access and refresh tokens in storage

---

#### 4. GET /api/v1/auth/me

Get current authenticated user's profile and subscription information.

**Authentication Required:** Yes

**Query Parameters:** None

**Success Response (200):**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
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

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Profile not found (edge case)

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
const { user, profile, subscription } = data;
```

**Notes:**
- Returns complete user context in one call
- Defaults to free plan if no subscription exists
- Use this endpoint to check authentication status

---

### Resume Endpoints

#### 5. GET /api/v1/resumes

List user's resumes with pagination and filtering.

**Authentication Required:** Yes

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (min: 1) |
| limit | integer | 20 | Items per page (min: 1, max: 100) |
| type | string | "all" | Filter by type: "base", "tailored", or "all" |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Software Engineer Resume",
      "is_base_resume": true,
      "target_role": "Software Engineer",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "location": "San Francisco, CA",
      "work_experience": [],
      "education": [],
      "skills": [],
      "projects": [],
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

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Invalid pagination parameters

**cURL Example:**
```bash
# List all resumes
curl "http://localhost:3021/api/v1/resumes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# List base resumes only with pagination
curl "http://localhost:3021/api/v1/resumes?type=base&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# List tailored resumes
curl "http://localhost:3021/api/v1/resumes?type=tailored" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const params = new URLSearchParams({
  type: 'base',
  page: '1',
  limit: '10',
});

const response = await fetch(`http://localhost:3021/api/v1/resumes?${params}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data, pagination } = await response.json();
```

**Notes:**
- Results ordered by updated_at descending (most recent first)
- Base resumes: user's master resume templates
- Tailored resumes: job-specific versions of base resumes
- Use pagination for large resume collections

---

#### 6. POST /api/v1/resumes

Create a new base resume.

**Authentication Required:** Yes

**Request Body:**
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
    "website": "https://johndoe.com",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "work_experience": [
      {
        "position": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "start_date": "2020-01",
        "end_date": "2024-01",
        "description": "Led development of key features",
        "responsibilities": [
          "Developed scalable microservices using Node.js and TypeScript",
          "Mentored 3 junior developers and conducted code reviews",
          "Improved API response time by 40% through optimization"
        ]
      }
    ],
    "education": [
      {
        "degree": "BS Computer Science",
        "institution": "University of California, Berkeley",
        "location": "Berkeley, CA",
        "graduation_date": "2020-05",
        "gpa": "3.8",
        "achievements": [
          "Dean's List all semesters",
          "CS Department Honors"
        ]
      }
    ],
    "skills": [
      {
        "category": "Programming Languages",
        "skills": ["JavaScript", "TypeScript", "Python", "Go"]
      },
      {
        "category": "Frameworks",
        "skills": ["React", "Next.js", "Node.js", "Express"]
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built full-stack e-commerce platform",
        "technologies": ["Next.js", "PostgreSQL", "Stripe"],
        "url": "https://github.com/johndoe/ecommerce"
      }
    ]
  }
}
```

**Import Options:**
- `import-profile`: Import data from user's profile
- `fresh`: Start with empty resume (no pre-filled data)
- `import-resume`: Import from existing resume (requires resume_id in selectedContent)

**Success Response (201):**
```json
{
  "data": {
    "resume": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Software Engineer Resume",
      "is_base_resume": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Validation errors (missing name, invalid email format, etc.)

**cURL Example:**
```bash
curl -X POST http://localhost:3021/api/v1/resumes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Resume",
    "importOption": "import-profile"
  }'
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/resumes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Software Engineer Resume',
    importOption: 'import-profile',
  }),
});

const { data } = await response.json();
const resumeId = data.resume.id;
```

**Notes:**
- Base resumes serve as templates for tailored resumes
- Use import-profile to quickly populate from existing profile
- All fields in selectedContent are optional
- JSONB fields (work_experience, education, skills, projects) use arrays

---

#### 7. GET /api/v1/resumes/:id

Get a specific resume by ID with all details.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Resume UUID

**Success Response (200):**
```json
{
  "data": {
    "resume": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Software Engineer Resume",
      "is_base_resume": true,
      "target_role": "Software Engineer",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "work_experience": [
        {
          "position": "Senior Software Engineer",
          "company": "Tech Corp",
          "location": "San Francisco, CA",
          "start_date": "2020-01",
          "end_date": "2024-01",
          "description": "Led development",
          "responsibilities": [
            "Developed scalable microservices",
            "Mentored junior developers"
          ]
        }
      ],
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

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume not found or access denied (ownership check)

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/resumes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const resumeId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/resumes/${resumeId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
const resume = data.resume;
```

**Notes:**
- Includes profile data if available
- Includes job data for tailored resumes
- Ownership verification prevents accessing other users' resumes

---

#### 8. PATCH /api/v1/resumes/:id

Update a resume (partial update supported).

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Resume UUID

**Request Body (all fields optional):**
```json
{
  "name": "Updated Resume Name",
  "target_role": "Senior Software Engineer",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+1234567890",
  "location": "San Francisco, CA",
  "work_experience": [
    {
      "position": "Senior Engineer",
      "company": "New Company",
      "location": "Remote",
      "start_date": "2024-01",
      "description": "Leading backend development",
      "responsibilities": [
        "Architected microservices infrastructure",
        "Improved system performance by 40%",
        "Led team of 5 engineers"
      ]
    }
  ],
  "education": [],
  "skills": [],
  "projects": []
}
```

**Success Response (200):**
```json
{
  "data": {
    "resume": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Updated Resume Name",
      "target_role": "Senior Software Engineer",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume not found or access denied
- `400 Bad Request`: Validation errors

**cURL Example:**
```bash
curl -X PATCH http://localhost:3021/api/v1/resumes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Resume Name",
    "target_role": "Senior Software Engineer"
  }'
```

**TypeScript Example:**
```typescript
const resumeId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/resumes/${resumeId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Updated Resume Name',
  }),
});

const { data } = await response.json();
```

**Notes:**
- Partial updates supported (only send fields to update)
- Updating JSONB arrays replaces entire array (not merge)
- Ownership verification required

---

#### 9. DELETE /api/v1/resumes/:id

Delete a resume permanently.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Resume UUID

**Success Response (200):**
```json
{
  "data": {
    "success": true
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume not found or access denied

**cURL Example:**
```bash
curl -X DELETE http://localhost:3021/api/v1/resumes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const resumeId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/resumes/${resumeId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
```

**Notes:**
- Permanent deletion (cannot be undone)
- Deleting tailored resume also deletes associated job
- Ownership verification required

---

#### 10. POST /api/v1/resumes/:id/score

Generate AI-powered score for a resume with detailed feedback.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Resume UUID

**Request Body (optional):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "config": {
    "model": "gpt-4o",
    "apiKeys": ["custom-api-key"]
  }
}
```

**Success Response (200):**
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
        "reason": "All essential contact information is present"
      },
      "detailLevel": {
        "score": 90,
        "reason": "Strong level of detail in work experience with specific examples"
      }
    },
    "impactScore": {
      "activeVoiceUsage": {
        "score": 85,
        "reason": "Most bullets use active voice and strong action verbs"
      },
      "quantifiedAchievements": {
        "score": 75,
        "reason": "Good use of metrics, could add more quantified results"
      }
    },
    "roleMatch": {
      "skillsRelevance": {
        "score": 90,
        "reason": "Skills are highly relevant to target role"
      },
      "experienceAlignment": {
        "score": 85,
        "reason": "Experience aligns well with role requirements"
      },
      "educationFit": {
        "score": 100,
        "reason": "Education meets or exceeds typical requirements"
      }
    },
    "jobAlignment": {
      "keywordMatch": {
        "score": 80,
        "reason": "Good keyword coverage from job description",
        "missingKeywords": ["Docker", "Kubernetes"]
      },
      "requirementsMatch": {
        "score": 85,
        "reason": "Most job requirements addressed",
        "gapAnalysis": ["5 years experience (have 4)"]
      },
      "companyFit": {
        "score": 90,
        "reason": "Experience aligns well with company culture and values"
      }
    },
    "overallImprovements": [
      "Add more quantified achievements with specific metrics",
      "Use stronger action verbs in some bullets",
      "Include more technical keywords naturally"
    ],
    "jobSpecificImprovements": [
      "Add experience with Docker and Kubernetes",
      "Highlight distributed systems experience",
      "Emphasize leadership and mentoring"
    ]
  }
}
```

**Scoring Breakdown:**

| Category | Max Points | What It Measures |
|----------|------------|------------------|
| Completeness | 40 | Contact info, detail level |
| Impact Score | 30 | Active voice, quantified achievements |
| Role Match | 25 | Skills relevance, experience alignment, education |
| Job Alignment | 30 | Keyword match, requirements match, company fit (only if job_id provided) |

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume or job not found
- `400 Bad Request`: Invalid UUID format

**cURL Example:**
```bash
# Score without job context
curl -X POST http://localhost:3021/api/v1/resumes/RESUME_ID/score \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Score with job context
curl -X POST http://localhost:3021/api/v1/resumes/RESUME_ID/score \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB_ID"
  }'
```

**TypeScript Example:**
```typescript
const response = await fetch(
  `http://localhost:3021/api/v1/resumes/${resumeId}/score`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_id: jobId, // optional
    }),
  }
);

const { data } = await response.json();
const overallScore = data.overallScore.score;
```

**Notes:**
- Scoring uses AI to analyze resume quality
- Including job_id enables job-specific scoring (adds jobAlignment category)
- Scoring counts toward AI usage limits
- Results include actionable improvement suggestions

---

#### 11. POST /api/v1/resumes/tailor

Create a tailored resume from a base resume for a specific job using AI.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "base_resume_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "generate_score": true,
  "config": {
    "model": "gpt-4o",
    "apiKeys": []
  }
}
```

**Success Response (200):**
```json
{
  "data": {
    "resume": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tailored Resume - Software Engineer at Tech Corp",
      "is_base_resume": false,
      "base_resume_id": "550e8400-e29b-41d4-a716-446655440000",
      "job_id": "550e8400-e29b-41d4-a716-446655440001",
      "work_experience": [],
      "education": [],
      "skills": [],
      "projects": [],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "score": {
      "overallScore": {
        "score": 88
      }
    }
  }
}
```

**Tailoring Process:**
1. Fetches base resume and job description
2. Uses AI to optimize content for the specific job:
   - Reorders experience to highlight relevant work
   - Incorporates job keywords naturally
   - Emphasizes matching skills and achievements
   - Adjusts bullet points to align with job requirements
3. Creates new tailored resume in database
4. Optionally generates score (if `generate_score: true`)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Base resume or job not found
- `400 Bad Request`: Invalid UUIDs, base_resume must be a base resume

**cURL Example:**
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

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/resumes/tailor', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    base_resume_id: baseResumeId,
    job_id: jobId,
    generate_score: true,
  }),
});

const { data } = await response.json();
const tailoredResumeId = data.resume.id;
const score = data.score?.overallScore.score;
```

**Notes:**
- Requires a base resume (not another tailored resume)
- AI usage counts toward subscription limits
- Tailored resume linked to job (deleting resume deletes job)
- Set generate_score to false to skip scoring and save AI credits
- Can customize AI model via config parameter

---

### Job Endpoints

#### 12. GET /api/v1/jobs

List user's jobs with pagination and filtering.

**Authentication Required:** Yes

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page (max: 100) |
| workLocation | string | - | Filter: "remote", "in_person", "hybrid" |
| employmentType | string | - | Filter: "full_time", "part_time", "co_op", "internship" |
| keywords[] | string[] | - | Filter by keywords (can specify multiple) |

**Success Response (200):**
```json
{
  "data": {
    "jobs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "company_name": "Tech Corp",
        "position_title": "Senior Software Engineer",
        "description": "We are looking for an experienced engineer...",
        "requirements": [
          "5+ years of experience",
          "Strong TypeScript skills",
          "Experience with React and Next.js"
        ],
        "responsibilities": [
          "Lead development of new features",
          "Mentor junior developers",
          "Design scalable systems"
        ],
        "work_location": "remote",
        "employment_type": "full_time",
        "salary_range": "$150k - $200k",
        "application_deadline": "2024-02-01",
        "company_culture": "Fast-paced startup environment",
        "benefits": ["Health insurance", "401k", "Unlimited PTO"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "totalCount": 15,
    "currentPage": 1,
    "totalPages": 2
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Invalid query parameters

**cURL Example:**
```bash
# List all jobs
curl "http://localhost:3021/api/v1/jobs" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter remote full-time jobs
curl "http://localhost:3021/api/v1/jobs?workLocation=remote&employmentType=full_time" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search with keywords
curl "http://localhost:3021/api/v1/jobs?keywords[]=TypeScript&keywords[]=React" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  workLocation: 'remote',
  employmentType: 'full_time',
});

const response = await fetch(`http://localhost:3021/api/v1/jobs?${params}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
const { jobs, totalCount, currentPage, totalPages } = data;
```

**Notes:**
- Results ordered by created_at descending
- Multiple keywords combined with AND logic
- Pagination metadata includes total count

---

#### 13. POST /api/v1/jobs

Create a new job posting.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "company_name": "Tech Corp",
  "position_title": "Senior Software Engineer",
  "description": "We are seeking a talented Senior Software Engineer to join our growing team. You will work on cutting-edge technologies and help shape the future of our products.",
  "requirements": [
    "5+ years of experience in software development",
    "Strong proficiency in TypeScript and JavaScript",
    "Experience with React, Next.js, or similar frameworks",
    "Knowledge of RESTful APIs and microservices",
    "Excellent problem-solving skills"
  ],
  "responsibilities": [
    "Lead development of new product features",
    "Mentor and guide junior developers",
    "Participate in architecture and design decisions",
    "Write clean, maintainable code with tests",
    "Collaborate with product and design teams"
  ],
  "work_location": "remote",
  "employment_type": "full_time",
  "salary_range": "$150,000 - $200,000",
  "application_deadline": "2024-02-01",
  "company_culture": "We're a fast-paced startup with a focus on innovation and work-life balance. We value collaboration, continuous learning, and making an impact.",
  "benefits": [
    "Comprehensive health, dental, and vision insurance",
    "401(k) with company match",
    "Unlimited PTO",
    "Remote work flexibility",
    "Professional development budget",
    "Latest tech equipment"
  ]
}
```

**Required Fields:**
- `company_name` (string)
- `position_title` (string)

**Optional Fields:**
- `description` (string)
- `requirements` (string[])
- `responsibilities` (string[])
- `work_location` (enum: "remote", "in_person", "hybrid")
- `employment_type` (enum: "full_time", "part_time", "co_op", "internship")
- `salary_range` (string)
- `application_deadline` (string, ISO date)
- `company_culture` (string)
- `benefits` (string[])

**Success Response (201):**
```json
{
  "data": {
    "job": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "company_name": "Tech Corp",
      "position_title": "Senior Software Engineer",
      "work_location": "remote",
      "employment_type": "full_time",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Validation errors (missing required fields)

**cURL Example:**
```bash
curl -X POST http://localhost:3021/api/v1/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Corp",
    "position_title": "Software Engineer",
    "description": "Job description here",
    "work_location": "remote",
    "employment_type": "full_time"
  }'
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/jobs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    company_name: 'Tech Corp',
    position_title: 'Senior Software Engineer',
    description: 'Job description...',
    requirements: ['5+ years experience', 'TypeScript'],
    work_location: 'remote',
    employment_type: 'full_time',
  }),
});

const { data } = await response.json();
const jobId = data.job.id;
```

**Notes:**
- Jobs are private to the creating user
- Use jobs to tailor resumes for specific applications
- JSONB arrays (requirements, responsibilities, benefits) stored as-is

---

#### 14. GET /api/v1/jobs/:id

Get a specific job by ID.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Job UUID

**Success Response (200):**
```json
{
  "data": {
    "job": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "company_name": "Tech Corp",
      "position_title": "Senior Software Engineer",
      "description": "Full job description...",
      "requirements": [
        "5+ years experience",
        "TypeScript proficiency"
      ],
      "responsibilities": [
        "Lead development",
        "Mentor team"
      ],
      "work_location": "remote",
      "employment_type": "full_time",
      "salary_range": "$150k - $200k",
      "application_deadline": "2024-02-01",
      "company_culture": "Fast-paced startup",
      "benefits": ["Health insurance", "401k"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Job not found or access denied (ownership check)

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const jobId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/jobs/${jobId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
const job = data.job;
```

**Notes:**
- Ownership verification prevents accessing other users' jobs
- Returns complete job details including all optional fields

---

#### 15. PATCH /api/v1/jobs/:id

Update a job (partial update supported).

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Job UUID

**Request Body (all fields optional):**
```json
{
  "position_title": "Staff Software Engineer",
  "salary_range": "$180,000 - $220,000",
  "description": "Updated job description",
  "requirements": [
    "7+ years experience",
    "Advanced TypeScript",
    "System design expertise"
  ],
  "application_deadline": "2024-03-01"
}
```

**Success Response (200):**
```json
{
  "data": {
    "job": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "position_title": "Staff Software Engineer",
      "salary_range": "$180,000 - $220,000",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Job not found or access denied
- `400 Bad Request`: Validation errors

**cURL Example:**
```bash
curl -X PATCH http://localhost:3021/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position_title": "Staff Software Engineer",
    "salary_range": "$180k - $220k"
  }'
```

**TypeScript Example:**
```typescript
const jobId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/jobs/${jobId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    position_title: 'Staff Software Engineer',
    salary_range: '$180k - $220k',
  }),
});

const { data } = await response.json();
```

**Notes:**
- Partial updates supported (only send fields to update)
- Updating JSONB arrays replaces entire array
- Ownership verification required
- Updated_at timestamp automatically updated

---

#### 16. DELETE /api/v1/jobs/:id

Delete a job permanently.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Job UUID

**Success Response (200):**
```json
{
  "data": {
    "success": true
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Job not found or access denied

**cURL Example:**
```bash
curl -X DELETE http://localhost:3021/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const jobId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/jobs/${jobId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
```

**Notes:**
- Permanent deletion (cannot be undone)
- Cascade deletes associated tailored resumes
- Ownership verification required

---

### Profile Endpoints

#### 17. GET /api/v1/profiles

Get current user's profile.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "data": {
    "profile": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "work_experience": [
        {
          "position": "Senior Software Engineer",
          "company": "Tech Corp",
          "location": "San Francisco, CA",
          "start_date": "2020-01",
          "end_date": "2024-01",
          "description": "Led development of key features",
          "responsibilities": [
            "Developed scalable systems",
            "Mentored junior developers"
          ]
        }
      ],
      "education": [
        {
          "degree": "BS Computer Science",
          "institution": "UC Berkeley",
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
      "projects": [
        {
          "name": "E-commerce Platform",
          "description": "Built full-stack platform",
          "technologies": ["Next.js", "PostgreSQL"],
          "url": "https://github.com/johndoe/project"
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Profile not found

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/profiles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/profiles', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
const profile = data.profile;
```

**Notes:**
- Profile serves as master data for creating base resumes
- One profile per user
- JSONB fields allow flexible data storage

---

#### 18. PATCH /api/v1/profiles

Update current user's profile.

**Authentication Required:** Yes

**Request Body (all fields optional):**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+1987654321",
  "location": "New York, NY",
  "website": "https://janesmith.com",
  "linkedin_url": "https://linkedin.com/in/janesmith",
  "github_url": "https://github.com/janesmith",
  "work_experience": [
    {
      "position": "Software Engineer",
      "company": "New Corp",
      "location": "Remote",
      "start_date": "2024-01",
      "description": "Building innovative solutions",
      "responsibilities": [
        "Built scalable microservices",
        "Improved system performance by 50%"
      ]
    }
  ],
  "education": [],
  "skills": [],
  "projects": []
}
```

**Success Response (200):**
```json
{
  "data": {
    "profile": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Validation errors

**cURL Example:**
```bash
curl -X PATCH http://localhost:3021/api/v1/profiles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "location": "New York, NY"
  }'
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/profiles', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    first_name: 'Jane',
    location: 'New York, NY',
  }),
});

const { data } = await response.json();
```

**Notes:**
- Partial updates supported
- Updating JSONB arrays replaces entire array
- Changes automatically revalidate relevant paths

---

#### 19. GET /api/v1/profiles/:id

Get any user's profile by user ID (Admin only).

**Authentication Required:** Yes (Admin role)

**URL Parameters:**
- `id` (string, required): User UUID

**Success Response (200):**
```json
{
  "data": {
    "profile": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Profile not found

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/profiles/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const userId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:3021/api/v1/profiles/${userId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
```

**Notes:**
- Admin-only endpoint (requires is_admin flag in database)
- Used for user management and support
- Returns complete profile including JSONB fields

---

### Cover Letter Endpoints

#### 20. POST /api/v1/cover-letters

Generate a cover letter for a job application using AI.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "resume_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "tone": "professional",
  "length": "medium"
}
```

**Tone Options:**
- `professional` - Formal and business-appropriate (default)
- `enthusiastic` - Energetic and passionate
- `creative` - Unique and personality-driven
- `formal` - Very formal and traditional

**Length Options:**
- `short` - ~200 words, concise
- `medium` - ~400 words, balanced (default)
- `long` - ~600 words, detailed

**Success Response (200):**
```json
{
  "data": {
    "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Software Engineer position at Tech Corp. With over 5 years of experience in full-stack development and a proven track record of delivering scalable solutions, I am confident I would be a valuable addition to your team.\n\nIn my current role at Current Company, I have led the development of multiple high-impact features...\n\nThank you for considering my application. I look forward to discussing how my skills and experience align with Tech Corp's needs.\n\nSincerely,\nJohn Doe",
    "metadata": {
      "resume_id": "550e8400-e29b-41d4-a716-446655440000",
      "job_id": "550e8400-e29b-41d4-a716-446655440001",
      "tone": "professional",
      "length": "medium",
      "generated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume or job not found
- `400 Bad Request`: Invalid parameters

**cURL Example:**
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

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/cover-letters', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    resume_id: resumeId,
    job_id: jobId,
    tone: 'professional',
    length: 'medium',
  }),
});

const { data } = await response.json();
const coverLetter = data.cover_letter;
```

**Notes:**
- AI generation counts toward subscription limits
- Cover letter tailored to resume and job
- Non-streaming endpoint (returns complete result)
- Ownership verification for resume and job

---

#### 21. GET /api/v1/cover-letters/:id

Get saved cover letter for a resume.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Resume UUID

**Success Response (200):**
```json
{
  "data": {
    "cover_letter": {
      "content": "Dear Hiring Manager,\n\nI am writing to express...",
      "metadata": {
        "tone": "professional",
        "length": "medium",
        "generated_at": "2024-01-01T00:00:00Z"
      }
    },
    "resume_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume not found or no cover letter exists

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/cover-letters/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const resumeId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(
  `http://localhost:3021/api/v1/cover-letters/${resumeId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const { data } = await response.json();
const coverLetter = data.cover_letter;
```

**Notes:**
- Cover letters stored in resume's cover_letter field
- Ownership verification required
- Returns null if no cover letter generated yet

---

#### 22. DELETE /api/v1/cover-letters/:id

Delete cover letter from a resume.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (string, required): Resume UUID

**Success Response (200):**
```json
{
  "data": {
    "success": true
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume not found

**cURL Example:**
```bash
curl -X DELETE http://localhost:3021/api/v1/cover-letters/RESUME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**TypeScript Example:**
```typescript
const resumeId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(
  `http://localhost:3021/api/v1/cover-letters/${resumeId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const { data } = await response.json();
```

**Notes:**
- Sets cover_letter to null and has_cover_letter to false
- Ownership verification required
- Can regenerate cover letter after deletion

---

### Optimization Endpoints

#### 23. POST /api/v1/optimize

Automated iterative resume optimization workflow.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "base_resume_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "target_score": 85,
  "max_iterations": 5,
  "config": {
    "model": "gpt-4o",
    "apiKeys": []
  }
}
```

**Parameters:**
- `base_resume_id` (required): Base resume UUID to optimize
- `job_id` (required): Target job UUID
- `target_score` (optional): Target score to achieve (0-100, default: 85)
- `max_iterations` (optional): Maximum optimization iterations (1-10, default: 5)
- `config` (optional): AI configuration (model, API keys)

**Success Response (200):**
```json
{
  "data": {
    "resume": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Optimized Resume - Software Engineer at Tech Corp",
      "is_base_resume": false,
      "job_id": "550e8400-e29b-41d4-a716-446655440001",
      "updated_at": "2024-01-01T00:05:00Z"
    },
    "score": {
      "overallScore": {
        "score": 88,
        "breakdown": {
          "completeness": 40,
          "impactScore": 28,
          "roleMatch": 24,
          "jobAlignment": 30
        }
      }
    },
    "iterations": 3,
    "target_achieved": true,
    "optimization_history": [
      {
        "iteration": 1,
        "score": 75,
        "changes": [
          "Added quantified achievements to work experience",
          "Improved active voice usage in bullets",
          "Incorporated missing keywords: Docker, Kubernetes"
        ],
        "timestamp": "2024-01-01T00:01:00Z"
      },
      {
        "iteration": 2,
        "score": 82,
        "changes": [
          "Enhanced skills section relevance",
          "Reordered experience to highlight relevant work",
          "Added specific metrics to achievements"
        ],
        "timestamp": "2024-01-01T00:03:00Z"
      },
      {
        "iteration": 3,
        "score": 88,
        "changes": [
          "Target score achieved"
        ],
        "timestamp": "2024-01-01T00:05:00Z"
      }
    ]
  }
}
```

**Optimization Workflow:**
1. **Initial Tailoring**: Creates tailored resume from base resume + job
2. **Iterative Loop** (up to max_iterations):
   - Score current resume
   - If score >= target_score, stop (success)
   - Identify weak areas (score < 80)
   - Generate optimization prompt focusing on weak areas
   - Use AI to optimize resume content
   - Update resume with optimized content
   - Track changes in history
3. **Final Scoring**: Score final resume

**Weak Areas Analyzed:**
- Completeness: Contact info, detail level
- Impact: Active voice, quantified achievements
- Role Match: Skills relevance, experience alignment, education
- Job Alignment: Keyword match, requirements match, company fit

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Base resume or job not found
- `400 Bad Request`: Invalid parameters, not a base resume

**cURL Example:**
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

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/optimize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    base_resume_id: baseResumeId,
    job_id: jobId,
    target_score: 85,
    max_iterations: 5,
  }),
});

const { data } = await response.json();
const optimizedResume = data.resume;
const finalScore = data.score.overallScore.score;
const targetAchieved = data.target_achieved;
const history = data.optimization_history;
```

**Notes:**
- Requires base resume (not tailored resume)
- AI-intensive operation (counts toward limits)
- May take 1-3 minutes depending on iterations
- Creates new tailored resume (doesn't modify base)
- History shows complete optimization journey
- Target may not be achieved if max_iterations reached

---

#### 24. POST /api/v1/optimize/chat

Interactive resume optimization via natural language.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "resume_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Add more quantified achievements to my work experience and make the bullets more impactful",
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "config": {
    "model": "gpt-4o"
  }
}
```

**Parameters:**
- `resume_id` (required): Resume UUID to optimize
- `message` (required): Natural language instruction
- `job_id` (optional): Job UUID for job-specific context
- `config` (optional): AI configuration

**Success Response (200):**
```json
{
  "data": {
    "resume": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "work_experience": [
        {
          "position": "Software Engineer",
          "company": "Tech Corp",
          "location": "San Francisco, CA",
          "start_date": "2020-01",
          "end_date": "2024-01",
          "description": "Led development",
          "responsibilities": [
            "Increased system performance by 40% through database optimization and caching strategies",
            "Reduced deployment time from 2 hours to 15 minutes by implementing CI/CD pipelines",
            "Led team of 5 engineers to deliver 3 major features, increasing user engagement by 25%"
          ]
        }
      ],
      "updated_at": "2024-01-01T00:01:00Z"
    },
    "message": "I've enhanced your work experience bullets with quantified achievements and stronger action verbs. Each bullet now includes specific metrics and demonstrates clear impact. The changes focus on measurable results that will catch recruiters' attention.",
    "changes_applied": [
      {
        "toolCallId": "call_abc123",
        "toolName": "update_resume",
        "args": {
          "description": "Added quantified achievements with metrics to all work experience bullets"
        },
        "state": "result",
        "result": {
          "success": true,
          "change": "Enhanced 3 work experience bullets with specific metrics and percentages"
        }
      }
    ]
  }
}
```

**Example Messages:**
- "Make my resume more ATS-friendly"
- "Add missing keywords from the job description"
- "Improve the impact of my experience bullets"
- "Make my summary more compelling for this role"
- "Reorder my experience to highlight relevant skills"
- "Remove buzzwords and use concrete examples"
- "Tailor my skills section to match the job requirements"

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resume or job not found
- `400 Bad Request`: Missing message

**cURL Example:**
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

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/optimize/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    resume_id: resumeId,
    message: 'Add more quantified achievements to my work experience',
    job_id: jobId, // optional
  }),
});

const { data } = await response.json();
const updatedResume = data.resume;
const aiMessage = data.message;
const changes = data.changes_applied;
```

**Notes:**
- More flexible than automated optimization
- Works with any resume (base or tailored)
- Including job_id provides job-specific context
- AI applies changes directly to resume
- Returns explanation of changes made
- Counts toward AI usage limits
- Great for iterative refinement

---

### Utility Endpoints

#### 25. GET /api/v1/health

Health check endpoint for monitoring.

**Authentication Required:** No

**Success Response (200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "resumelm-api",
  "environment": "production"
}
```

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/health
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/health');
const health = await response.json();
```

**Notes:**
- Use for uptime monitoring
- No authentication required
- Returns server status and metadata

---

#### 26. GET /api/v1/docs

OpenAPI 3.0 specification endpoint.

**Authentication Required:** No

**Success Response (200):**
Returns complete OpenAPI specification JSON with:
- API metadata and version
- All endpoints with request/response schemas
- Authentication scheme (Bearer JWT)
- Schema definitions
- Example requests and responses

**cURL Example:**
```bash
curl http://localhost:3021/api/v1/docs
```

**TypeScript Example:**
```typescript
const response = await fetch('http://localhost:3021/api/v1/docs');
const openApiSpec = await response.json();
```

**Notes:**
- Use with Swagger UI or Redoc for interactive docs
- Complete API schema for code generation
- Includes all 24 operational endpoints

---

## Error Handling

### Error Response Structure

```json
{
  "error": {
    "message": "Detailed error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {
      "field": "Additional error context"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed (Zod errors) |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist or access denied |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests for subscription plan |
| `INTERNAL_ERROR` | 500 | Server error (contact support) |
| `SERVICE_UNAVAILABLE` | 503 | Temporary service outage |

### Validation Errors

Validation errors include field-specific details:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "issues": [
        {
          "path": ["email"],
          "message": "Invalid email address"
        },
        {
          "path": ["password"],
          "message": "Password must be at least 6 characters"
        }
      ]
    }
  }
}
```

### Error Handling Best Practices

1. **Check HTTP Status Codes**: Always check response status before parsing
2. **Parse Error Details**: Error responses include actionable information
3. **Handle 401 Errors**: Refresh token or redirect to login
4. **Retry 5xx Errors**: Implement exponential backoff for server errors
5. **Display User-Friendly Messages**: Convert technical errors to user-friendly text

**TypeScript Error Handling Example:**
```typescript
async function fetchWithErrorHandling(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();

      // Handle specific error codes
      if (errorData.error.code === 'UNAUTHORIZED') {
        // Refresh token or redirect to login
        await refreshToken();
        return fetchWithErrorHandling(url, options); // Retry
      }

      if (errorData.error.statusCode >= 500) {
        // Server error - retry with backoff
        await delay(1000);
        return fetchWithErrorHandling(url, options);
      }

      // Show user-friendly error
      throw new Error(errorData.error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Best Practices

### Security

1. **Never Expose Tokens**
   - Store tokens securely (httpOnly cookies for web apps)
   - Never commit tokens to version control
   - Use environment variables for API keys

2. **Use HTTPS in Production**
   - Always use HTTPS for API calls in production
   - Prevents token interception

3. **Implement Token Refresh**
   - Refresh tokens before they expire
   - Handle 401 errors by refreshing and retrying

4. **Validate Inputs Client-Side**
   - Pre-validate before sending requests
   - Saves API calls and provides instant feedback

### Performance

1. **Use Pagination**
   - Always paginate list endpoints
   - Keep limit reasonable (10-50 items)

2. **Implement Caching**
   - Cache profile and resume data client-side
   - Revalidate on updates

3. **Batch Related Calls**
   - Use `/auth/me` to get user + profile + subscription in one call
   - Minimize round trips

4. **Monitor Rate Limits**
   - Implement exponential backoff
   - Track usage against subscription limits

### AI Operations

1. **Choose Appropriate Models**
   - Use GPT-4 for best quality (slower, more expensive)
   - Use GPT-3.5 for faster, cheaper operations
   - Configure via `config.model` parameter

2. **Optimize Iterations**
   - Set realistic target_score (80-85 is good)
   - Limit max_iterations (3-5 is usually enough)
   - More iterations = higher costs

3. **Use Chat Optimization for Refinement**
   - Automated optimization for initial tailoring
   - Chat optimization for specific improvements
   - Combine both for best results

4. **Provide Context**
   - Always include job_id for job-specific optimizations
   - More context = better AI results

### API Client Design

1. **Centralize API Logic**
```typescript
class ResumeLMClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers = new Headers(options?.headers);

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    if (options?.body && typeof options.body === 'object') {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAccessToken(data.data.access_token);
    return data;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Resume methods
  async listResumes(params?: { type?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/resumes${query ? `?${query}` : ''}`);
  }

  async createResume(data: any) {
    return this.request<any>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ... more methods
}
```

2. **Implement Retry Logic**
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isServerError = error.statusCode >= 500;
      const isLastAttempt = attempt === maxRetries - 1;

      if (!isServerError || isLastAttempt) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

3. **Handle Token Refresh**
```typescript
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Check if token is about to expire (implement JWT decode)
    if (this.isTokenExpiringSoon(this.accessToken)) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<void> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });

        const { data } = await response.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private isTokenExpiringSoon(token: string): boolean {
    // Implement JWT expiry check
    // Return true if token expires in < 5 minutes
    return false;
  }
}
```

### Rate Limiting

**Subscription Tiers:**
- **Free Plan**: 10 req/min, 100 req/hour
- **Pro Plan**: 60 req/min, 1000 req/hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

**Handle Rate Limits:**
```typescript
async function handleRateLimiting(response: Response) {
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
    const waitTime = resetTime * 1000 - Date.now();

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      // Retry request
    }
  }
}
```

---

## Troubleshooting

### Common Issues

**Issue: 401 Unauthorized despite having token**
- Token may be expired (check expiry, refresh token)
- Token may be malformed (check for whitespace, encoding)
- Token may be for wrong environment (dev vs prod)
- **Solution**: Refresh token or re-login

**Issue: 404 Not Found for existing resource**
- May be ownership issue (can only access own resources)
- Resource may have been deleted
- UUID may be incorrect
- **Solution**: Verify ownership and UUID format

**Issue: 400 Validation Error**
- Check request body against schema
- Ensure required fields present
- Validate data types (string vs number)
- Check array/object structure
- **Solution**: Review error.details for specific field errors

**Issue: Optimization not achieving target score**
- Target score may be unrealistic (try 80-85)
- Base resume may lack necessary content
- Job description may be too different from experience
- **Solution**: Review optimization history, adjust base resume, lower target

**Issue: AI operations timing out**
- Large resumes take longer to process
- Complex optimizations require more iterations
- Network issues may interrupt requests
- **Solution**: Reduce max_iterations, optimize in smaller chunks, check network

**Issue: Rate limit exceeded**
- Too many requests in short period
- Check subscription tier limits
- **Solution**: Implement backoff, upgrade plan, batch operations

### Debug Checklist

1. ✓ Check HTTP status code
2. ✓ Verify authentication token present and valid
3. ✓ Validate request body matches schema
4. ✓ Confirm UUID format correct
5. ✓ Check ownership of resources
6. ✓ Review error.details for specific issues
7. ✓ Check network connectivity
8. ✓ Verify API base URL correct (dev vs prod)
9. ✓ Check rate limit headers
10. ✓ Review subscription plan limits

### Support

For additional help:
- **Email**: support@resumelm.com
- **Documentation**: https://docs.resumelm.com
- **GitHub Issues**: https://github.com/resumelm/issues
- **Status Page**: https://status.resumelm.com

---

**API Version**: v1
**Last Updated**: 2024-01-01
**Base URL (Dev)**: http://localhost:3021/api/v1
**Base URL (Prod)**: https://yourdomain.com/api/v1
