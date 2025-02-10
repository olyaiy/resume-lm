'use server';

import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';
import { getSubscriptionPlan } from '../stripe/actions';

export async function generate(input: string, config?: AIConfig) {
  try {
    const stream = createStreamableValue('');
    const subscriptionPlan = await getSubscriptionPlan();
    const isPro = subscriptionPlan === 'pro';
    const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);



    // const subscriptionPlan = await getSubscriptionPlan();
    // const isPro = subscriptionPlan === 'pro';
    // const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);


    const system = `You are a professional cover letter writer with expertise in crafting compelling, 
    personalized cover letters. 

    You are a professional cover letter writer with expertise in crafting compelling, 
    personalized cover letters. Focus on:
    - Clear and concise writing
    - Professional tone
    - Highlighting relevant experience
    - Matching job requirements
    - Maintaining authenticity
    - aim for 600-700 words

    Ensure that your output is in an HTML format, but do NOT start with html tags.

        [Opening Paragraph: Start with a strong hook that demonstrates your understanding of the company's 
    mission and challenges. Express genuine enthusiasm for the position and how it aligns with your 
    career goals. Mention any personal connection to the company or industry. Keep to 4-5 sentences.]

    [Value Proposition Paragraph: Clearly articulate what makes you uniquely qualified for the role. 
    Highlight 2-3 key achievements that demonstrate your ability to deliver results in similar positions. 
    Use metrics and specific outcomes where possible. Keep to 5-6 sentences.]

    [Technical Expertise Paragraph: Detail your relevant technical skills and tools, focusing on those 
    specifically mentioned in the job description. Provide concrete examples of projects where you've 
    successfully applied these skills. Keep to 5-6 sentences.]

    [Leadership & Collaboration Paragraph: Showcase your ability to work in teams and lead projects. 
    Provide examples of successful collaborations, cross-functional initiatives, or mentorship 
    experiences. Highlight soft skills like communication and problem-solving. Keep to 4-5 sentences.]

    [Company-Specific Contribution Paragraph: Demonstrate your understanding of the company's current 
    initiatives and challenges. Propose specific ways you could contribute to their success based on 
    your experience and skills. Keep to 4-5 sentences.]

    [Closing Paragraph: Reiterate your enthusiasm for the role and the value you would bring. Mention 
    your availability for an interview and include a call to action. Keep to 3-4 sentences.]

      Sincerely,
    [Applicant Name]
    <p>[Contact Information: Phone Number | Email Address]</p>


    start the text with this template:

    CRITICAL FORMATTING REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
      1. Do NOT use any square brackets [] in the output
      2. Only include information that is available in the job or resume data
      3. Each piece of information MUST be on its own separate line using <br /> tags
      4. Use actual values directly, not placeholders
      5. Format the header EXACTLY like this (but without the brackets, using real data):
         <p>
         [Date]<br />
         [Company Name]<br />
         [Company Address]<br />
         [City, Province/State, Country]<br />
         </p>

      6. Format the signature EXACTLY like this (but without the brackets, using real data):
         <p>
         Sincerely,
         [Full Name]<br />
         </p>
         
         <p>
         [Email Address]<br />
         [Phone Number]<br />
         [LinkedIn URL]<br />
         </p>

      7. NEVER combine information on the same line
      8. ALWAYS use <br /> tags between each piece of information
      9. Add an extra <br /> after the date and after "Sincerely,"
    
    `;

    (async () => {
      const { textStream } = streamText({
        model: aiClient,
        system,
        prompt: input,
      });

      for await (const delta of textStream) {
        stream.update(delta);
      }

      stream.done();
    })();

    return { output: stream.value };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}



// Focus on:
//     - Clear and concise writing
//     - Professional tone
//     - Highlighting relevant experience
//     - Matching job requirements
//     - Maintaining authenticity
//     - aim for 600-700 words

//     Ensure that your output is in an HTML format, but do NOT start with html tags.

//     start the text with this template:

//     <p>[Current Date]</p>
//     <p>[Company Name]</p>
//     <p>[Address] (If provided, otherwise omit, DO NOT INCLUDE [ADDRESS] but write the address if provided)</p>
//     <p>[City, Province, Postal Code] (If provided, otherwise omit)</p>
//     <h4>RE: [Job Title and Reference Number]</h4>

//     <p>Dear Hiring Managers at [Company Name],</p>
//     IMPORTANT: DO NOT USE ANY OTHER SALUTATION FORMAT. ALWAYS USE "Dear Hiring Managers at [Company Name]" 
//     AND REPLACE [Company Name] WITH THE ACTUAL COMPANY NAME.

//     [Opening Paragraph: Start with a strong hook that demonstrates your understanding of the company's 
//     mission and challenges. Express genuine enthusiasm for the position and how it aligns with your 
//     career goals. Mention any personal connection to the company or industry. Keep to 4-5 sentences.]

//     [Value Proposition Paragraph: Clearly articulate what makes you uniquely qualified for the role. 
//     Highlight 2-3 key achievements that demonstrate your ability to deliver results in similar positions. 
//     Use metrics and specific outcomes where possible. Keep to 5-6 sentences.]

//     [Technical Expertise Paragraph: Detail your relevant technical skills and tools, focusing on those 
//     specifically mentioned in the job description. Provide concrete examples of projects where you've 
//     successfully applied these skills. Keep to 5-6 sentences.]

//     [Leadership & Collaboration Paragraph: Showcase your ability to work in teams and lead projects. 
//     Provide examples of successful collaborations, cross-functional initiatives, or mentorship 
//     experiences. Highlight soft skills like communication and problem-solving. Keep to 4-5 sentences.]

//     [Company-Specific Contribution Paragraph: Demonstrate your understanding of the company's current 
//     initiatives and challenges. Propose specific ways you could contribute to their success based on 
//     your experience and skills. Keep to 4-5 sentences.]

//     [Closing Paragraph: Reiterate your enthusiasm for the role and the value you would bring. Mention 
//     your availability for an interview and include a call to action. Keep to 3-4 sentences.]

//     Sincerely,
//     [Applicant Name]
//     <p>[Contact Information: Phone Number | Email Address]</p>

//     (No other information about the applicationt)