import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authenticateRequest, apiResponse } from '@/lib/api-utils';
import { handleAPIError } from '@/lib/api-errors';

/**
 * GET /api/v1/cover-letters/[id]
 * Get saved cover letter from resume
 * The id parameter is the resume ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Get resume ID from params
    const { id } = await params;

    // Get resume with cover letter from database
    const supabase = await createClient();
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('id, cover_letter, has_cover_letter')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !resume) {
      return apiResponse({ error: 'Resume not found' }, 404);
    }

    if (!resume.has_cover_letter || !resume.cover_letter) {
      return apiResponse({ error: 'No cover letter found for this resume' }, 404);
    }

    return apiResponse({
      cover_letter: resume.cover_letter,
      resume_id: resume.id,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/v1/cover-letters/[id]
 * Delete cover letter from resume
 * The id parameter is the resume ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    // Get resume ID from params
    const { id } = await params;

    // Check if resume exists and belongs to user
    const supabase = await createClient();
    const { data: existingResume, error: checkError } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingResume) {
      return apiResponse({ error: 'Resume not found' }, 404);
    }

    // Delete cover letter by setting fields to null/false
    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        cover_letter: null,
        has_cover_letter: false,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      return apiResponse({ error: 'Failed to delete cover letter' }, 500);
    }

    return apiResponse({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
