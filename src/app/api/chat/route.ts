import { LanguageModelV1, ToolInvocation, smoothStream, streamText } from 'ai';
import { Resume, Job } from '@/lib/types';
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';
import { tools } from '@/lib/tools';
import { getSubscriptionPlan } from '@/utils/actions/stripe/actions';
import { checkRateLimit } from '@/lib/rateLimiter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatRequest {
  messages: Message[];
  resume: Resume;
  target_role: string;
  config?: AIConfig;
  job?: Job;
}

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    
    // Console log the entire request to see what's being sent
    console.log('=== FULL CHAT REQUEST ===');
    console.log('Request body keys:', Object.keys(requestBody));
    console.log('Messages count:', requestBody.messages?.length || 0);
    console.log('Target role:', requestBody.target_role);
    console.log('Config:', JSON.stringify(requestBody.config, null, 2));
    console.log('Job:', requestBody.job ? 'Job object present' : 'No job');
    console.log('Resume present:', !!requestBody.resume);
    
    if (requestBody.resume) {
      console.log('Resume keys:', Object.keys(requestBody.resume));
      console.log('Resume first_name:', requestBody.resume.first_name);
      console.log('Resume last_name:', requestBody.resume.last_name);
      console.log('Resume target_role:', requestBody.resume.target_role);
      console.log('Work experience count:', requestBody.resume.work_experience?.length || 0);
      console.log('Education count:', requestBody.resume.education?.length || 0);
      console.log('Skills count:', requestBody.resume.skills?.length || 0);
      console.log('Projects count:', requestBody.resume.projects?.length || 0);
    }
    
    console.log('Full request body:', JSON.stringify(requestBody, null, 2));
    console.log('=== END CHAT REQUEST ===');

    const { messages, target_role, config, job, resume }: ChatRequest = requestBody;

    // Get subscription plan and user ID
    const { plan, id } = await getSubscriptionPlan(true);
    const isPro = plan === 'pro';

    // Apply rate limiting only for Pro users
    if (isPro) {
      try {
        await checkRateLimit(id);
      } catch (error) {
        // Add type checking for error
        const message = error instanceof Error ? error.message : 'Rate limit exceeded';
        const match = message.match(/(\d+) seconds/);
        const retryAfter = match ? parseInt(match[1], 10) : 60;
        
        return new Response(
          JSON.stringify({ 
            error: message, // Use validated message
            expirationTimestamp: Date.now() + retryAfter * 1000
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfter),
            },
          }
        );
      }
    }

    // Initialize the AI client using the provided config and plan.
    const aiClient = initializeAIClient(config, isPro);

    // Build and send the AI call.
    const result = streamText({
      model: aiClient as LanguageModelV1,
      system: `
      You are ResumeLM, an expert technical resume consultant 
      specializing in computer science and software 
      engineering careers. Your expertise spans resume 
      optimization, technical writing, and industry best 
      practices for tech job applications.

      TOOL USAGE INSTRUCTIONS:
      1. For work experience improvements:
         - Use 'suggest_work_experience_improvement' with 'index' and 'improved_experience' fields
         - Always include company, position, date, and description
      
      2. For project improvements:
         - Use 'suggest_project_improvement' with 'index' and 'improved_project' fields
         - Always include name and description
      
      3. For skill improvements:
         - Use 'suggest_skill_improvement' with 'index' and 'improved_skill' fields
         - Only use for adding new or removing existing skills
      
      4. For education improvements:
         - Use 'suggest_education_improvement' with 'index' and 'improved_education' fields
         - Always include school, degree, field, and date
      
      5. For viewing resume sections:
         - Use 'getResume' with 'sections' array
         - Valid sections: 'all', 'personal_info', 'work_experience', 'education', 'skills', 'projects'

      6. For multiple section updates:
         - Use 'modifyWholeResume' when changing multiple sections at once

      Aim to use a maximum of 5 tools in one go, then confirm with the user if they would like you to continue.
      The target role is ${target_role}. The job is ${job ? JSON.stringify(job) : 'No job specified'}.
      Current resume summary: ${resume ? `${resume.first_name} ${resume.last_name} - ${resume.target_role}` : 'No resume data'}.
      `,
      messages,
      maxSteps: 5,
      tools,
      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: 'word', // optional: defaults to 'word'
      }),
    
    });

    return result.toDataStreamResponse({
      sendUsage: false,
      getErrorMessage: error => {
        if (!error) return 'Unknown error occurred';
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
