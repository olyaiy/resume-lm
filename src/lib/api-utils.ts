import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { UnauthorizedError, handleAPIError } from './api-errors';

/**
 * Extract JWT token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate request and return user or throw UnauthorizedError
 * @throws {UnauthorizedError} If authentication fails
 */
export async function authenticateRequest(req: Request): Promise<User> {
  const token = extractToken(req);

  if (!token) {
    throw new UnauthorizedError('Missing or invalid authorization token');
  }

  const supabase = await createClient();

  // Verify token and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  return user;
}

/**
 * Get authenticated user or return null if unauthorized
 * Does not throw errors - returns null instead
 */
export async function getAuthUser(req: Request): Promise<User | null> {
  try {
    return await authenticateRequest(req);
  } catch {
    return null;
  }
}

/**
 * Create a successful API response with data
 */
export function apiResponse<T>(data: T, status: number = 200): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, {
    status,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

/**
 * Create an error API response
 */
export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
        statusCode: status,
      },
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * Create a validation error response with detailed error information
 */
export function apiValidationError(errors: z.ZodIssue[]): NextResponse {
  return NextResponse.json(
    {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: {
          issues: errors.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
      },
    },
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * Validate request body against a Zod schema
 * Returns parsed data or error response
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    // Parse request body
    const body = await req.json();

    // Validate against schema
    const result = schema.safeParse(body);

    if (!result.success) {
      return { error: apiValidationError(result.error.issues) };
    }

    return { data: result.data };
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return { error: apiError('Invalid JSON in request body', 400) };
    }

    // Handle other errors
    return { error: handleAPIError(error) };
  }
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  req: Request,
  schema: z.Schema<T>
): { data: T } | { error: NextResponse } {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const result = schema.safeParse(params);

    if (!result.success) {
      return { error: apiValidationError(result.error.issues) };
    }

    return { data: result.data };
  } catch (error) {
    return { error: handleAPIError(error) };
  }
}

/**
 * Check if the authenticated user has admin privileges
 * @throws {ForbiddenError} If user is not an admin
 */
export async function requireAdmin(user: User): Promise<void> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (error || !profile?.is_admin) {
    const { ForbiddenError } = await import('./api-errors');
    throw new ForbiddenError('Admin privileges required');
  }
}

/**
 * Parse pagination parameters from request
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePaginationParams(req: Request): PaginationParams {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create paginated response
 */
export interface PaginatedData<T> {
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

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): NextResponse<PaginatedData<T>> {
  const totalPages = Math.ceil(total / params.limit);

  return NextResponse.json({
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  });
}

/**
 * Type guard to check if validation result contains data
 */
export function hasValidationData<T>(
  result: { data: T } | { error: NextResponse }
): result is { data: T } {
  return 'data' in result;
}
