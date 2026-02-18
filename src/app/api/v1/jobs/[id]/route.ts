import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  authenticateRequest,
  validateRequest,
  hasValidationData,
  apiResponse,
} from '@/lib/api-utils';
import { updateJobRequestSchema } from '@/lib/api-schemas';
import { handleAPIError, NotFoundError, ForbiddenError } from '@/lib/api-errors';
import { deleteJob } from '@/utils/actions/jobs/actions';

/**
 * GET /api/v1/jobs/[id]
 * Get a single job by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    const { id: jobId } = await params;

    // Create Supabase client
    const supabase = await createClient();

    // Query job from database
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new NotFoundError('Job not found');
    }

    // Check if user owns this job
    if (job.user_id !== user.id) {
      throw new ForbiddenError('You do not have access to this job');
    }

    // Return job
    return apiResponse({ job });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/v1/jobs/[id]
 * Update a job by ID
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    const { id: jobId } = await params;

    // Validate request body
    const validation = await validateRequest(req, updateJobRequestSchema);

    if (!hasValidationData(validation)) {
      return validation.error;
    }

    const updateData = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // First check if job exists and user owns it
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', jobId)
      .single();

    if (fetchError || !existingJob) {
      throw new NotFoundError('Job not found');
    }

    if (existingJob.user_id !== user.id) {
      throw new ForbiddenError('You do not have permission to update this job');
    }

    // Update job in database
    const { data: job, error: updateError } = await supabase
      .from('jobs')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    if (updateError || !job) {
      throw new Error('Failed to update job');
    }

    // Return updated job
    return apiResponse({ job });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/v1/jobs/[id]
 * Delete a job by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    const { id: jobId } = await params;

    // Create Supabase client
    const supabase = await createClient();

    // First check if job exists and user owns it
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', jobId)
      .single();

    if (fetchError || !existingJob) {
      throw new NotFoundError('Job not found');
    }

    if (existingJob.user_id !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this job');
    }

    // Call server action to delete job
    await deleteJob(jobId);

    // Return success response
    return apiResponse({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
