import { NextRequest } from 'next/server';
import {
  getAuthenticatedServiceClient,
  validateRequest,
  hasValidationData,
  apiResponse,
} from '@/lib/api-utils';
import { createJobRequestSchema } from '@/lib/api-schemas';
import { handleAPIError } from '@/lib/api-errors';

/**
 * GET /api/v1/jobs
 * List jobs with pagination and filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request and get service role client
    const { user, supabase } = await getAuthenticatedServiceClient(req);

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
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

    // Get jobs from database using authenticated Supabase client
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply filters if they exist
    if (filters.workLocation) {
      query = query.eq('work_location', filters.workLocation);
    }
    if (filters.employmentType) {
      query = query.eq('employment_type', filters.employmentType);
    }
    if (filters.keywords && filters.keywords.length > 0) {
      query = query.contains('keywords', filters.keywords);
    }

    // Add pagination
    const { data: jobs, error, count } = await query
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch job listings');
    }

    // Return paginated response
    return apiResponse({
      jobs,
      totalCount: count ?? 0,
      currentPage: page,
      totalPages: Math.ceil((count ?? 0) / pageSize),
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
    // Authenticate request and get service role client
    const { user, supabase } = await getAuthenticatedServiceClient(req);

    // Validate request body
    const validation = await validateRequest(req, createJobRequestSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const jobData = validation.data;

    // Create job directly in database using service role client
    // SECURITY: user_id is explicitly set to authenticated user
    const jobRecord = {
      user_id: user.id,
      company_name: jobData.company_name,
      position_title: jobData.position_title,
      job_url: jobData.job_url || null,
      description: jobData.description || null,
      location: jobData.location || null,
      salary_range: jobData.salary_range || null,
      keywords: jobData.keywords || [],
      work_location: jobData.work_location || 'in_person',
      employment_type: jobData.employment_type || 'full_time',
      is_active: true
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([jobRecord])
      .select()
      .single();

    if (error) {
      console.error('[POST /api/v1/jobs] Error creating job:', error);
      throw new Error('Failed to create job');
    }

    // Return created job
    return apiResponse({ job }, 201);
  } catch (error) {
    return handleAPIError(error);
  }
}
