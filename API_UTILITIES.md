# API Utilities Documentation

This document describes the API utilities, schemas, and error handling system for the ResumeLM application.

## Files Overview

### 1. `/src/lib/api-errors.ts`
Custom error classes and error handling utilities for consistent API error responses.

### 2. `/src/lib/api-utils.ts`
Authentication helpers, response formatters, and request validation utilities.

### 3. `/src/lib/api-schemas.ts`
Zod schemas for API request validation and TypeScript type definitions.

---

## API Errors (`api-errors.ts`)

### Error Classes

All error classes extend the base `APIError` class and include:
- HTTP status code
- Error code
- Error message
- Optional details

#### Available Error Classes

```typescript
import {
  APIError,           // Base error class
  ValidationError,    // 400 - Invalid request data
  UnauthorizedError,  // 401 - Missing/invalid auth token
  ForbiddenError,     // 403 - Insufficient permissions
  NotFoundError,      // 404 - Resource not found
  RateLimitError,     // 429 - Rate limit exceeded
  InternalServerError,// 500 - Server error
  ServiceUnavailableError, // 503 - Service unavailable
} from '@/lib/api-errors';
```

#### Usage

```typescript
// Throw errors in your API routes
throw new NotFoundError('Resume not found');
throw new ValidationError('Invalid email format', { field: 'email' });
throw new UnauthorizedError(); // Uses default message
```

### Error Handler

The `handleAPIError` function converts any error to a proper NextResponse:

```typescript
import { handleAPIError } from '@/lib/api-errors';

export async function GET(req: Request) {
  try {
    // Your API logic
  } catch (error) {
    return handleAPIError(error); // Returns formatted error response
  }
}
```

### Type Guard

```typescript
import { isAPIError } from '@/lib/api-errors';

if (isAPIError(error)) {
  console.log('Status:', error.statusCode);
}
```

---

## API Utilities (`api-utils.ts`)

### Authentication

#### `authenticateRequest(req: Request): Promise<User>`

Authenticates a request by verifying the JWT token from the Authorization header.

**Throws:** `UnauthorizedError` if authentication fails

```typescript
import { authenticateRequest } from '@/lib/api-utils';

export async function GET(req: Request) {
  const user = await authenticateRequest(req);
  // user.id, user.email, etc.
}
```

#### `getAuthUser(req: Request): Promise<User | null>`

Same as `authenticateRequest` but returns `null` instead of throwing errors.

```typescript
const user = await getAuthUser(req);
if (user) {
  // User is authenticated
} else {
  // User is not authenticated
}
```

#### `requireAdmin(user: User): Promise<void>`

Checks if user has admin privileges. Throws `ForbiddenError` if not.

```typescript
const user = await authenticateRequest(req);
await requireAdmin(user); // Throws if not admin
// Continue with admin-only logic
```

### Response Helpers

#### `apiResponse<T>(data: T, status?: number): NextResponse`

Creates a successful API response with data.

```typescript
import { apiResponse } from '@/lib/api-utils';

return apiResponse({ id: '123', name: 'Test' }, 201);
// Returns: { data: { id: '123', name: 'Test' } }
```

#### `apiError(message: string, status?: number): NextResponse`

Creates an error response.

```typescript
return apiError('Invalid request', 400);
// Returns: { error: { message: 'Invalid request', statusCode: 400 } }
```

#### `apiValidationError(errors: z.ZodIssue[]): NextResponse`

Creates a validation error response with detailed error information.

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  return apiValidationError(result.error.issues);
}
```

### Request Validation

#### `validateRequest<T>(req: Request, schema: z.Schema<T>)`

Validates request body against a Zod schema.

```typescript
import { validateRequest, hasValidationData } from '@/lib/api-utils';
import { createJobRequestSchema } from '@/lib/api-schemas';

const validation = await validateRequest(req, createJobRequestSchema);

if (!hasValidationData(validation)) {
  return validation.error; // Return error response
}

const jobData = validation.data; // TypeScript knows this is CreateJobRequest
```

#### `validateQueryParams<T>(req: Request, schema: z.Schema<T>)`

Validates URL query parameters.

```typescript
const validation = validateQueryParams(req, getJobsQuerySchema);
if (hasValidationData(validation)) {
  const { page, limit, search } = validation.data;
}
```

### Pagination

#### `parsePaginationParams(req: Request): PaginationParams`

Extracts pagination parameters from query string.

```typescript
import { parsePaginationParams } from '@/lib/api-utils';

const { page, limit, offset } = parsePaginationParams(req);
// Default: page=1, limit=10, offset=0
// Max limit enforced: 100
```

#### `createPaginatedResponse<T>(data: T[], total: number, params: PaginationParams)`

Creates a paginated response with metadata.

```typescript
import { parsePaginationParams, createPaginatedResponse } from '@/lib/api-utils';

const params = parsePaginationParams(req);
const jobs = await fetchJobs(params.limit, params.offset);
const total = await countJobs();

return createPaginatedResponse(jobs, total, params);
// Returns: { data: [...], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }
```

---

## API Schemas (`api-schemas.ts`)

### Authentication Schemas

```typescript
import { loginRequestSchema, signupRequestSchema } from '@/lib/api-schemas';

// Login
const login = loginRequestSchema.parse({
  email: 'user@example.com',
  password: 'password123'
});

// Signup
const signup = signupRequestSchema.parse({
  name: 'John Doe',
  email: 'user@example.com',
  password: 'Password123'
});
```

### Job Schemas

```typescript
import {
  createJobRequestSchema,
  updateJobRequestSchema,
  getJobsQuerySchema
} from '@/lib/api-schemas';

// Create job
const jobData = createJobRequestSchema.parse({
  company_name: 'Acme Corp',      // Required
  position_title: 'Engineer',      // Required
  job_url: 'https://...',
  description: 'Job description',
  location: 'Remote',
  work_location: 'remote',
  employment_type: 'full_time'
});

// Update job (all fields optional)
const updates = updateJobRequestSchema.parse({
  description: 'Updated description'
});

// Query parameters
const query = getJobsQuerySchema.parse({
  page: 1,
  limit: 20,
  is_active: true,
  search: 'engineer'
});
```

### Resume Schemas

```typescript
import {
  createResumeRequestSchema,
  updateResumeRequestSchema,
  getResumesQuerySchema
} from '@/lib/api-schemas';

// Create resume
const resume = createResumeRequestSchema.parse({
  name: 'Software Engineer Resume',
  target_role: 'Full Stack Developer',
  email: 'john@example.com',
  work_experience: [...],
  skills: [...]
});
```

### AI Operation Schemas

```typescript
import {
  tailorResumeRequestSchema,
  optimizeResumeRequestSchema,
  scoreResumeRequestSchema,
  generateCoverLetterRequestSchema,
  improveTextRequestSchema
} from '@/lib/api-schemas';

// Tailor resume to job
const tailorRequest = tailorResumeRequestSchema.parse({
  resume_id: '123e4567-e89b-12d3-a456-426614174000',
  job_id: '123e4567-e89b-12d3-a456-426614174001',
  options: {
    focus_areas: ['work_experience', 'skills'],
    optimization_level: 'moderate'
  }
});

// Optimize resume
const optimizeRequest = optimizeResumeRequestSchema.parse({
  resume_id: '123e4567-e89b-12d3-a456-426614174000',
  section: 'work_experience',
  options: {
    improve_ats: true,
    enhance_impact: true,
    add_metrics: true
  }
});

// Score resume
const scoreRequest = scoreResumeRequestSchema.parse({
  resume_id: '123e4567-e89b-12d3-a456-426614174000',
  job_id: '123e4567-e89b-12d3-a456-426614174001',
  criteria: {
    ats_compatibility: true,
    keyword_match: true
  }
});

// Generate cover letter
const coverLetterRequest = generateCoverLetterRequestSchema.parse({
  resume_id: '123e4567-e89b-12d3-a456-426614174000',
  job_id: '123e4567-e89b-12d3-a456-426614174001',
  tone: 'professional',
  length: 'medium'
});

// Improve text
const improveRequest = improveTextRequestSchema.parse({
  text: 'Worked on various projects',
  context: 'work_experience',
  goal: 'impact'
});
```

### Response Type Interfaces

```typescript
import type {
  APIResponse,
  PaginatedResponse,
  OptimizationResult,
  ScoringResult,
  TailoringResult,
  CoverLetterResult,
  TextImprovementResult
} from '@/lib/api-schemas';

// Standard response
const response: APIResponse<{ id: string }> = {
  data: { id: '123' },
  message: 'Success'
};

// Paginated response
const paginated: PaginatedResponse<Job> = {
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrev: false
  }
};

// Optimization result
const optimization: OptimizationResult = {
  resume_id: '...',
  optimized_sections: ['work_experience'],
  changes_made: [...],
  suggestions: [...],
  metadata: { ... }
};
```

---

## Complete API Route Examples

### Example 1: Simple Protected Endpoint

```typescript
import { NextRequest } from 'next/server';
import { authenticateRequest, apiResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);

    // Your logic here
    const data = { userId: user.id, message: 'Success' };

    return apiResponse(data);
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Example 2: POST with Validation

```typescript
import { NextRequest } from 'next/server';
import { authenticateRequest, validateRequest, hasValidationData, apiResponse } from '@/lib/api-utils';
import { createJobRequestSchema } from '@/lib/api-schemas';
import { handleAPIError } from '@/lib/api-errors';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);

    const validation = await validateRequest(req, createJobRequestSchema);
    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const jobData = validation.data;

    // Create job in database
    const newJob = await createJob(user.id, jobData);

    return apiResponse(newJob, 201);
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Example 3: Paginated GET

```typescript
import { NextRequest } from 'next/server';
import { authenticateRequest, parsePaginationParams, createPaginatedResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { page, limit, offset } = parsePaginationParams(req);

    const jobs = await fetchJobs(user.id, limit, offset);
    const total = await countJobs(user.id);

    return createPaginatedResponse(jobs, total, { page, limit, offset });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Example 4: Resource with Authorization

```typescript
import { NextRequest } from 'next/server';
import { authenticateRequest, apiResponse } from '@/lib/api-utils';
import { handleAPIError, NotFoundError, ForbiddenError } from '@/lib/api-errors';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    const { id } = await params;

    const job = await findJob(id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.user_id !== user.id) {
      throw new ForbiddenError('You cannot delete this job');
    }

    await deleteJob(id);

    return apiResponse({ message: 'Job deleted successfully' });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Example 5: Admin-Only Endpoint

```typescript
import { NextRequest } from 'next/server';
import { authenticateRequest, requireAdmin, apiResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    await requireAdmin(user);

    // Admin-only logic
    const result = await performAdminAction();

    return apiResponse(result);
  } catch (error) {
    return handleAPIError(error);
  }
}
```

---

## Best Practices

1. **Always use try-catch blocks** with `handleAPIError` for consistent error handling
2. **Validate all inputs** using Zod schemas before processing
3. **Use type guards** like `hasValidationData` for type-safe validation flows
4. **Authenticate requests** at the start of protected endpoints
5. **Check authorization** after authentication when accessing resources
6. **Return proper status codes** (200, 201, 400, 401, 403, 404, etc.)
7. **Use pagination** for list endpoints to improve performance
8. **Log errors** but don't expose internal details in production

---

## TypeScript Benefits

All utilities are fully typed:

- Request validation returns strongly typed data
- Response helpers enforce structure
- Error classes have proper type hierarchies
- Schemas export inferred types
- Type guards narrow types correctly

Example:

```typescript
const validation = await validateRequest(req, createJobRequestSchema);

if (hasValidationData(validation)) {
  // TypeScript knows validation.data is CreateJobRequest
  const company: string = validation.data.company_name; // ✓ Type-safe
} else {
  // TypeScript knows validation.error is NextResponse
  return validation.error;
}
```

---

## Environment Requirements

The authentication utilities require these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

Ensure these are set in your `.env.local` file.
