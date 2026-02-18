# Resume Optimization Workflow Guide

Complete guide to ResumeLM's AI-powered resume optimization workflow.

## Table of Contents

- [Overview](#overview)
- [Workflow Architecture](#workflow-architecture)
- [Step-by-Step Process](#step-by-step-process)
- [Configuration Options](#configuration-options)
- [Scoring System](#scoring-system)
- [Optimization Strategies](#optimization-strategies)
- [Best Practices](#best-practices)
- [Example Use Cases](#example-use-cases)
- [Troubleshooting](#troubleshooting)

---

## Overview

The ResumeLM optimization workflow is an **automated, iterative process** that uses AI to continuously improve your resume until it reaches a target score. Unlike one-time optimization, this workflow:

- **Scores** your resume against a job description
- **Identifies** specific weak areas
- **Optimizes** content to address those weaknesses
- **Repeats** until target score is achieved or max iterations reached
- **Tracks** all changes for transparency

### When to Use

- **Job-specific tailoring**: Optimize a base resume for a specific job posting
- **ATS optimization**: Improve keyword matching and formatting for applicant tracking systems
- **Impact enhancement**: Strengthen achievement statements with metrics
- **Score improvement**: Systematically improve overall resume quality

---

## Workflow Architecture

```
┌─────────────────────┐
│  Base Resume        │
│  + Job Description  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  1. Create Initial  │
│  Tailored Resume    │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Iteration    │◄──────────┐
    │ Loop         │           │
    └──────┬───────┘           │
           │                   │
           ▼                   │
    ┌──────────────┐           │
    │ 2a. Score    │           │
    │ Resume       │           │
    └──────┬───────┘           │
           │                   │
           ▼                   │
    ┌──────────────┐           │
    │ 2b. Check    │  No       │
    │ Target Met?  ├───────────┤
    └──────┬───────┘           │
           │ Yes               │
           ▼                   │
    ┌──────────────┐           │
    │ 2c. Identify │           │
    │ Weak Areas   │           │
    └──────┬───────┘           │
           │                   │
           ▼                   │
    ┌──────────────┐           │
    │ 2d. AI       │           │
    │ Optimization │           │
    └──────┬───────┘           │
           │                   │
           ▼                   │
    ┌──────────────┐           │
    │ 2e. Update   │           │
    │ Resume       │───────────┘
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ 3. Final     │
    │ Scoring      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Return       │
    │ Optimized    │
    │ Resume       │
    └──────────────┘
```

---

## Step-by-Step Process

### Step 1: Initialize Optimization

**Input Required**:
- Base resume ID (must be a base resume, not tailored)
- Job description ID
- Target score (default: 85)
- Max iterations (default: 5)

**What Happens**:
1. Validates base resume ownership
2. Fetches job description
3. Uses AI to create initial tailored version
4. Saves tailored resume to database

### Step 2: Iterative Optimization Loop

Each iteration performs the following:

#### 2a. Score Current Resume

Generates comprehensive score across 4 categories:

```json
{
  "completeness": {
    "contactInformation": { "score": 100, "weight": 20 },
    "detailLevel": { "score": 85, "weight": 20 }
  },
  "impactScore": {
    "activeVoiceUsage": { "score": 80, "weight": 15 },
    "quantifiedAchievements": { "score": 70, "weight": 15 }
  },
  "roleMatch": {
    "skillsRelevance": { "score": 90, "weight": 10 },
    "experienceAlignment": { "score": 85, "weight": 10 },
    "educationFit": { "score": 100, "weight": 5 }
  },
  "jobAlignment": {
    "keywordMatch": { "score": 75, "weight": 10 },
    "requirementsMatch": { "score": 80, "weight": 15 },
    "companyFit": { "score": 85, "weight": 5 }
  }
}
```

#### 2b. Check Target Achievement

If `current_score >= target_score`, workflow terminates successfully.

#### 2c. Identify Weak Areas

Analyzes score breakdown to find categories scoring < 80:

**Example Weak Areas**:
- Contact Information (missing LinkedIn)
- Quantified Achievements (lacks metrics)
- Keyword Match (missing job-specific terms)
- Requirements Match (doesn't address all qualifications)

#### 2d. Generate Optimization Prompt

Creates focused prompt targeting only weak areas:

```
CURRENT SCORE: 78/100

WEAK AREAS REQUIRING IMPROVEMENT (score < 80):
1. Quantified Achievements
2. Keyword Match
3. Requirements Match

SPECIFIC SUGGESTIONS:
1. Add specific metrics to achievements (e.g., percentages, dollar amounts)
2. Missing keywords: microservices, Kubernetes, CI/CD
3. Address requirement: "Experience with cloud infrastructure"

OPTIMIZATION INSTRUCTIONS:
- Focus ONLY on weak areas
- Incorporate missing keywords naturally
- Quantify achievements with specific metrics
- Use strong action verbs
- Maintain factual accuracy
- DO NOT fabricate experience
```

#### 2e. AI Optimization

Sends prompt to AI with structured output schema:

```typescript
{
  content: {
    // Optimized resume following simplifiedResumeSchema
    work_experience: [...],
    education: [...],
    skills: [...]
  },
  changes_made: [
    "Added metrics to 3 work experience bullets",
    "Incorporated keywords: Kubernetes, CI/CD",
    "Emphasized cloud infrastructure experience"
  ]
}
```

#### 2f. Update Resume

Applies optimized content to database and tracks changes in history.

### Step 3: Final Scoring

After loop completion (target achieved or max iterations reached):
- Performs final comprehensive scoring
- Returns complete results with optimization history

---

## Configuration Options

### AI Configuration

```typescript
{
  model: string,           // AI model to use
  apiKeys: string[],       // Optional custom API keys
  customPrompts: object    // Custom prompt templates
}
```

**Supported Models**:
- `gpt-4o` (OpenAI, recommended)
- `gpt-4o-mini` (OpenAI, faster/cheaper)
- `claude-3-5-sonnet-20241022` (Anthropic)
- `gemini-2.0-flash-exp` (Google)
- `deepseek-chat` (DeepSeek)

**Model Selection Strategy**:
- **Quality priority**: `gpt-4o` or `claude-3-5-sonnet`
- **Speed priority**: `gpt-4o-mini` or `gemini-2.0-flash-exp`
- **Cost priority**: `deepseek-chat` or `gpt-4o-mini`

### Workflow Parameters

```typescript
{
  base_resume_id: string,    // Required: Base resume to optimize
  job_id: string,            // Required: Target job
  target_score: number,      // Default: 85, Range: 0-100
  max_iterations: number,    // Default: 5, Range: 1-10
  config: AIConfig           // Optional: AI configuration
}
```

**Parameter Guidelines**:

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| target_score | 85-90 | Higher may require many iterations |
| max_iterations | 3-7 | Balance quality vs. API costs |

---

## Scoring System

### Overall Score Calculation

```
Overall Score = (Completeness * 40%) +
                (Impact Score * 30%) +
                (Role Match * 25%) +
                (Job Alignment * 30%)
```

Note: Job Alignment only applies to tailored resumes.

### Score Categories

#### 1. Completeness (40 points)

**Contact Information** (20 points):
- Email, phone, location present
- Professional links (LinkedIn, GitHub, portfolio)

**Detail Level** (20 points):
- Sufficient bullet points per position
- Comprehensive skill coverage
- Complete education information

#### 2. Impact Score (30 points)

**Active Voice Usage** (15 points):
- Percentage of bullets using action verbs
- Strong vs. weak verb usage
- Consistency across sections

**Quantified Achievements** (15 points):
- Presence of metrics, percentages, dollar amounts
- Specific numbers vs. vague statements
- Impact demonstration

#### 3. Role Match (25 points)

**Skills Relevance** (10 points):
- Technical skills alignment
- Soft skills relevance
- Skill depth and breadth

**Experience Alignment** (10 points):
- Years of experience match
- Relevant industry experience
- Progressive responsibility

**Education Fit** (5 points):
- Degree requirements met
- Relevant coursework
- GPA (if applicable)

#### 4. Job Alignment (30 points)

**Keyword Match** (10 points):
- Job description keyword coverage
- Natural keyword integration
- Technical term accuracy

**Requirements Match** (15 points):
- Qualification coverage
- Responsibility alignment
- Gap identification

**Company Fit** (5 points):
- Company culture alignment
- Value demonstration
- Industry knowledge

---

## Optimization Strategies

### Strategy 1: Keyword Integration

**Problem**: Low keyword match score (< 80)

**Optimization Approach**:
1. Extract keywords from job description
2. Identify naturally fitting locations in resume
3. Integrate keywords into existing bullets
4. Add new bullets if necessary

**Example**:

Before:
```
- Developed backend services
```

After:
```
- Developed scalable microservices using Kubernetes and Docker
```

### Strategy 2: Quantification Enhancement

**Problem**: Low quantified achievements score (< 80)

**Optimization Approach**:
1. Identify achievements without metrics
2. Add percentages, dollar amounts, time savings
3. Use specific numbers over ranges
4. Demonstrate measurable impact

**Example**:

Before:
```
- Improved system performance
- Led team to deliver features
```

After:
```
- Improved system performance by 40% through database optimization
- Led team of 5 engineers to deliver 3 major features ahead of schedule
```

### Strategy 3: Active Voice Strengthening

**Problem**: Low active voice usage (< 80)

**Optimization Approach**:
1. Replace passive constructions
2. Start bullets with strong action verbs
3. Use present tense for current role
4. Use past tense for previous roles

**Example**:

Before:
```
- Responsible for code reviews
- Was involved in system design
```

After:
```
- Conducted code reviews for 50+ pull requests weekly
- Designed scalable system architecture serving 1M+ users
```

### Strategy 4: Requirements Addressing

**Problem**: Low requirements match (< 80)

**Optimization Approach**:
1. List all job requirements
2. Map resume content to requirements
3. Emphasize matching experience
4. Reorder bullets to highlight relevance

**Example**:

Job Requirement: "5+ years of React experience"

Before (buried in middle):
```
- Fixed bugs in React components
```

After (prominent, quantified):
```
- Led React development for 6 years, building 15+ production applications
- Architected reusable React component library used across 10 teams
```

---

## Best Practices

### 1. Start with Quality Base Resume

Ensure your base resume:
- Contains accurate, complete information
- Uses consistent formatting
- Has no spelling/grammar errors
- Includes all relevant experience

### 2. Set Realistic Targets

| Resume Quality | Target Score |
|----------------|--------------|
| Entry-level | 75-80 |
| Mid-level | 80-85 |
| Senior-level | 85-90 |
| Executive | 90-95 |

### 3. Monitor Iteration History

Track what changes are made:
```json
{
  "iteration": 2,
  "score": 82,
  "changes": [
    "Added metrics to 3 bullets",
    "Incorporated keywords: Docker, Kubernetes"
  ]
}
```

Review changes to ensure:
- Factual accuracy
- Natural language
- No hallucinated content

### 4. Iterate Conservatively

**Recommended approach**:
- Start with target_score: 80, max_iterations: 3
- Review results
- If satisfactory, use higher target for refinement
- If issues, adjust base resume and retry

### 5. Validate AI Changes

Always review optimized content for:
- **Accuracy**: No fabricated experience
- **Relevance**: Changes align with job
- **Quality**: Natural language, no AI artifacts
- **Consistency**: Formatting and style maintained

---

## Example Use Cases

### Use Case 1: Entry-Level Software Engineer

**Scenario**: Recent graduate applying for first job

**Configuration**:
```json
{
  "base_resume_id": "uuid",
  "job_id": "uuid",
  "target_score": 75,
  "max_iterations": 3
}
```

**Iteration 1 (Score: 65)**:
- Added contact information
- Enhanced education section with relevant coursework
- Added GitHub projects

**Iteration 2 (Score: 72)**:
- Quantified project metrics (users, performance)
- Incorporated job keywords (React, Node.js)
- Strengthened action verbs

**Iteration 3 (Score: 78)**:
- Target achieved
- Final review: Approved

### Use Case 2: Senior DevOps Engineer

**Scenario**: 8 years experience, applying for senior role

**Configuration**:
```json
{
  "base_resume_id": "uuid",
  "job_id": "uuid",
  "target_score": 88,
  "max_iterations": 5,
  "config": {
    "model": "gpt-4o"
  }
}
```

**Iteration 1 (Score: 78)**:
- Enhanced keyword coverage (Kubernetes, Terraform, AWS)
- Added metrics to infrastructure achievements

**Iteration 2 (Score: 83)**:
- Reordered experience to highlight cloud expertise
- Added leadership examples with team size

**Iteration 3 (Score: 87)**:
- Emphasized cost savings and efficiency gains
- Aligned responsibilities with job requirements

**Iteration 4 (Score: 89)**:
- Target achieved
- Total time: ~2 minutes

### Use Case 3: Career Transition

**Scenario**: Moving from frontend to full-stack role

**Configuration**:
```json
{
  "base_resume_id": "uuid",
  "job_id": "uuid",
  "target_score": 82,
  "max_iterations": 5
}
```

**Iteration 1 (Score: 68)**:
- Highlighted backend experience (previously secondary)
- Added database and API development projects

**Iteration 2 (Score: 75)**:
- Incorporated full-stack keywords (Node.js, PostgreSQL)
- Emphasized end-to-end feature ownership

**Iteration 3 (Score: 80)**:
- Demonstrated system design experience
- Added DevOps-related achievements

**Iteration 4 (Score: 84)**:
- Target achieved
- Successfully repositioned for full-stack role

---

## Troubleshooting

### Issue: Score Not Improving

**Symptoms**:
- Score stays same or decreases between iterations
- Changes don't address weak areas

**Solutions**:
1. Check base resume quality - ensure accurate, complete data
2. Lower target_score to realistic level
3. Review optimization history for unhelpful changes
4. Try different AI model (gpt-4o recommended)
5. Manually improve base resume before retrying

### Issue: Hallucinated Content

**Symptoms**:
- AI adds experiences you never had
- Fabricated metrics or achievements

**Solutions**:
1. Review changes in optimization_history
2. Revert to previous iteration
3. Use more conservative temperature (0.3-0.5)
4. Add constraints in custom prompts
5. Always validate final resume manually

### Issue: Unnatural Language

**Symptoms**:
- Awkward phrasing
- Repetitive words
- AI-sounding content

**Solutions**:
1. Use higher quality model (gpt-4o)
2. Reduce max_iterations (fewer passes = more natural)
3. Manually edit final resume
4. Provide better base resume with natural language

### Issue: Keyword Stuffing

**Symptoms**:
- Excessive keyword repetition
- Unnatural keyword placement
- Resume reads poorly

**Solutions**:
1. Lower target_score (< 90)
2. Review keyword match suggestions
3. Manually integrate keywords naturally
4. Use interactive chat for specific adjustments

### Issue: Timeout or Slow Performance

**Symptoms**:
- Request takes > 2 minutes
- Timeout errors

**Solutions**:
1. Reduce max_iterations
2. Use faster model (gpt-4o-mini, gemini-2.0-flash-exp)
3. Simplify base resume (fewer bullets)
4. Check API rate limits
5. Retry during off-peak hours

---

## Advanced Features

### Interactive Refinement

After automated optimization, use chat endpoint for specific changes:

```bash
POST /api/v1/optimize/chat
{
  "resume_id": "optimized_resume_id",
  "message": "Make the first work experience bullet more concise"
}
```

### Custom Prompts

Override default optimization prompts:

```json
{
  "config": {
    "customPrompts": {
      "optimization": "Focus heavily on leadership and team management..."
    }
  }
}
```

### Batch Optimization

Optimize one base resume for multiple jobs:

```typescript
const jobs = ["job_1", "job_2", "job_3"];

for (const job_id of jobs) {
  const result = await optimizeResume({
    base_resume_id: "uuid",
    job_id,
    target_score: 85
  });

  console.log(`Job ${job_id}: Score ${result.score.overallScore.score}`);
}
```

---

## API Reference

See [API.md](./API.md) for complete endpoint documentation:
- `POST /api/v1/optimize` - Automated optimization workflow
- `POST /api/v1/optimize/chat` - Interactive optimization
- `POST /api/v1/resumes/:id/score` - Resume scoring

---

## FAQ

**Q: How long does optimization take?**
A: Typically 30 seconds to 2 minutes depending on iterations and model.

**Q: Can I optimize an already tailored resume?**
A: No, only base resumes can be optimized. Use chat endpoint for tailored resume edits.

**Q: What if I don't reach target score?**
A: Review base resume quality, lower target, or manually improve weak areas.

**Q: Is AI optimization safe?**
A: Always review changes for accuracy. AI can suggest but shouldn't fabricate.

**Q: Can I undo optimization?**
A: Optimization creates a new tailored resume, leaving base resume unchanged.

**Q: How many iterations should I use?**
A: 3-5 is optimal. More iterations risk diminishing returns and unnatural language.

**Q: Which AI model is best?**
A: gpt-4o offers best quality. gpt-4o-mini is faster and cheaper with good results.

**Q: Can I optimize without a job description?**
A: No, job description is required for scoring and targeted optimization.

---

## Support

For assistance with optimization workflow:
- Documentation: https://docs.resumelm.com
- Email: support@resumelm.com
- GitHub: https://github.com/resumelm/issues
