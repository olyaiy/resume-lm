import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  validateRequest,
  hasValidationData,
  apiResponse,
} from '@/lib/api-utils';
import { createJobRequestSchema } from '@/lib/api-schemas';
import { handleAPIError, NotFoundError } from '@/lib/api-errors';
import { createJob, getJobListings } from '@/utils/actions/jobs/actions';

/**
 * GET /api/v1/jobs
 * List jobs with pagination and filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
      is_active: url.searchParams.get('is_active'),
      search: url.searchParams.get('search'),
    };

    // Convert page and limit to numbers
    const page = Math.max(1, parseInt(queryParams.page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10)));

    // Build filters object
    const filters: {
      workLocation?: 'remote' | 'in_person' | 'hybrid';
      employmentType?: 'full_time' | 'part_time' | 'co_op' | 'internship';
      keywords?: string[];
    } = {};

    // Parse workLocation from query
    const workLocation = url.searchParams.get('workLocation');
    if (workLocation && ['remote', 'in_person', 'hybrid'].includes(workLocation)) {
      filters.workLocation = workLocation as 'remote' | 'in_person' | 'hybrid';
    }

    // Parse employmentType from query
    const employmentType = url.searchParams.get('employmentType');
    if (employmentType && ['full_time', 'part_time', 'co_op', 'internship'].includes(employmentType)) {
      filters.employmentType = employmentType as 'full_time' | 'part_time' | 'co_op' | 'internship';
    }

    // Parse keywords from query (can be multiple)
    const keywords = url.searchParams.getAll('keywords[]');
    if (keywords.length > 0) {
      filters.keywords = keywords;
    }

    // Call server action to get job listings
    const result = await getJobListings({
      page,
      pageSize,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    });

    // Return paginated response
    return apiResponse({
      jobs: result.jobs,
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * POST /api/v1/jobs
 * Create a new job
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    await authenticateRequest(req);

    // Validate request body
    const validation = await validateRequest(req, createJobRequestSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const jobData = validation.data;

    // Call server action to create job
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = await createJob(jobData as any);

    if (!job) {
      throw new NotFoundError('Failed to create job');
    }

    // Return created job
    return apiResponse({ job }, 201);
  } catch (error) {
    return handleAPIError(error);
  }
}
