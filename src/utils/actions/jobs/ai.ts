'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { 
  simplifiedJobSchema, 
  simplifiedResumeSchema, 
} from "@/lib/zod-schemas";
import { Job, Resume } from "@/lib/types";
import { AIConfig } from '@/utils/ai-tools';
import { initializeAIClient } from '@/utils/ai-tools';
import { getSubscriptionPlan } from '../stripe/actions';


export async function tailorResumeToJob(
  resume: Resume, 
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig
) {
  const subscriptionPlan = await getSubscriptionPlan();
  const isPro = subscriptionPlan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
try {
    const { object } = await generateObject({
      model: aiClient,
      schema: z.object({
      content: simplifiedResumeSchema,
    }),
    prompt: `
    You are a senior technical resume engineer specializing in machine-learning-driven ATS optimization for software roles.  
    Transform the resume using surgical rewording and technical alignment:  

    **Technical Transformation Protocol**  
    1. **Semantic Rewiring**:  
      - Map generic terms to JD-specific technical lexicon using synonym chains:  
        "Coding → Development → Software Engineering → [JD: 'Full lifecycle engineering']"  
      - Convert passive descriptions to active JD terminology:  
        "Worked on systems" → "Architected distributed systems [JD keyword] using circuit breaker patterns"  

    2. **STAR-Driven Technical Storytelling**:  
      For each experience point:  
      - **Situation**: Anchor in technical context  
        "During cloud migration initiative [JD: 'Multi-cloud environment']..."  
      - **Task**: Align to JD requirements  
        "Address system reliability mandate [JD: '99.99% SLA']..."  
      - **Action**: Mirror JD's technical verbs + stack details  
        "Containerized legacy apps using Docker → Implemented container orchestration [JD term] via Kubernetes (v1.28, Helm charts)"  
      - **Result**: Inject quantifiable technical outcomes  
        "50% latency reduction → Achieved 112ms p99 latency [JD metric] through Redis cache optimization"  

    3. **Precision Technical Enhancements**:  
      - Convert stack lists to JD-aligned hierarchies:  
        "Python → Python 3.10 (NumPy, PyTorch 2.0, FastAPI)"  
      - Add architectural context:  
        "Built APIs → Designed event-driven microservices [JD pattern] handling 25k RPS"  
      - Embed technical parentheticals:  
        "CI/CD pipeline (GitHub Actions → ArgoCD [JD tool])"  

    **Strict Technical Constraints**:  
    - Never invent tools/versions - only enhance existing resume data  
    - Preserve original employment chronology  
    - Require 1:1 mapping between JD technical requirements and resume content  
    - If no direct match exists: "Legacy system modernization → Cloud migration patterns [JD concept]"  
    - Force metric anchoring: "Improved performance → 3.2x throughput increase via Go profiling"  
    - Remove all [JD...] annotations from final content - these are for your internal reference only. IT IS CRUICAL THAT THESE JD REFRENCES DO NOT MAKE IT INTO THE FINAL OUTPUT.

    Resume:
    ${JSON.stringify(resume, null, 2)}
    
    Job Description:
    ${JSON.stringify(jobListing, null, 2)}
    `,
  });

    // console.log('Tailored Resume Response:');
    // console.dir({
    //   input: { resume, jobListing },
    //   output: object.content
    // }, { depth: null });

    return object.content satisfies z.infer<typeof simplifiedResumeSchema>;
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
}

export async function formatJobListing(jobListing: string, config?: AIConfig) {
  const subscriptionPlan = await getSubscriptionPlan();
  const isPro = subscriptionPlan === 'pro';
  const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
try {
    const { object } = await generateObject({
      model: aiClient,
      schema: z.object({
      content: simplifiedJobSchema
    }),

    system: `You are an AI assistant specializing in structured data extraction from job listings. You have been provided with a schema
              and must adhere to it strictly. When processing the given job listing, follow these steps:
              IMPORTANT: For any missing or uncertain information, you must return an empty string ("") - never return "<UNKNOWN>" or similar placeholders.

            Read the entire job listing thoroughly to understand context, responsibilities, requirements, and any other relevant details.
            Perform the analysis as described in each TASK below.
            Return your final output in a structured format (e.g., JSON or the prescribed schema), using the exact field names you have been given.
            Do not guess or fabricate information that is not present in the listing; instead, return an empty string for missing fields.
            Do not include chain-of-thought or intermediate reasoning in the final output; provide only the structured results.
            
            For the description field:
            1. Start with 3-5 bullet points highlighting the most important responsibilities of the role.
               - Format these bullet points using markdown, with each point on a new line starting with "• "
               - These should be the most critical duties mentioned in the job listing
            2. After the bullet points, include the full job description stripped of:
               - Any non-job-related content
            3. Format the full description as a clean paragraph, maintaining proper grammar and flow.`,
            
            
    prompt: `Analyze this job listing carefully and extract structured information.

              TASK 1 - ESSENTIAL INFORMATION:
              Extract the basic details (company, position, URL, location, salary).
              For the description, include 3-5 key responsibilities as bullet points.

              TASK 2 - KEYWORD ANALYSIS:
              1. Technical Skills: Identify all technical skills, programming languages, frameworks, and tools
              2. Soft Skills: Extract interpersonal and professional competencies
              3. Industry Knowledge: Capture domain-specific knowledge requirements
              4. Required Qualifications: List education, certifications, and experience levels
              5. Responsibilities: Key job functions and deliverables

              Format the output according to the schema, ensuring:
              - Keywords as they are (e.g., "React.js" → "React.js")
              - Skills are deduplicated and categorized
              - Seniority level is inferred from context
              - Description contains 3-5 bullet points of key responsibilities
              Usage Notes:

              - If certain details (like salary or location) are missing, return "" (an empty string).
              - Adhere to the schema you have been provided, and format your response accordingly (e.g., JSON fields must match exactly).
              - Avoid exposing your internal reasoning.
              - DO NOT RETURN "<UNKNOWN>", if you are unsure of a piece of data, return an empty string.
              Job Listing Text: ${jobListing}`,});


              
    return object.content satisfies Partial<Job>;
  } catch (error) {
    console.error('Error formatting job listing:', error);
    throw error;
  }
}