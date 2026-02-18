import { NextResponse } from 'next/server';

/**
 * Base API error class
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code || this.name;
    this.details = details;
    Object.setPrototypeOf(this, APIError.prototype);
  }

  toJSON() {
    const json: {
      error: {
        message: string;
        code: string;
        statusCode: number;
        details?: unknown;
      };
    } = {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
      },
    };

    if (this.details) {
      json.error.details = this.details;
    }

    return json;
  }
}

/**
 * Validation error for request data
 */
export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Unauthorized access error
 */
export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden access error
 */
export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', retryAfter ? { retryAfter } : undefined);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Internal server error
 */
export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends APIError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Error handler that converts errors to appropriate HTTP responses
 */
export function handleAPIError(error: unknown): NextResponse {
  // Log error for debugging
  console.error('API Error:', error);

  // Handle known API errors
  if (error instanceof APIError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = new ValidationError('Validation failed', error);
    return NextResponse.json(validationError.toJSON(), { status: validationError.statusCode });
  }

  // Handle unknown errors
  const internalError = new InternalServerError(
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error instanceof Error
        ? error.message
        : 'Unknown error'
  );

  return NextResponse.json(internalError.toJSON(), { status: internalError.statusCode });
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}
