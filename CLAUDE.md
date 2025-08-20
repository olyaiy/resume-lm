# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResumeLM is an AI-powered resume builder using Next.js 15, React 19, TypeScript, Supabase, and multiple AI providers. The application helps users create ATS-optimized resumes with AI assistance.

## Essential Commands

```bash
# Development with Turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## Architecture Overview

### Core Stack
- **Next.js 15** with App Router - Server-first architecture with minimal client-side JavaScript
- **Supabase** for authentication and PostgreSQL database with Row Level Security
- **AI Integration** via Vercel AI SDK supporting OpenAI, Anthropic, Google Gemini, DeepSeek, Groq
- **Stripe** for subscription management
- **Shadcn UI + Radix** for component library
- **TipTap** for rich text editing in resume sections
- **React PDF** for PDF generation

### Database Architecture

Three main tables with RLS policies:
- **profiles**: Base resume information (JSONB fields for flexible data)
- **resumes**: Both base and job-tailored resumes
- **jobs**: Job descriptions for tailoring

Key JSONB structures:
```typescript
work_experience: Array<{
  position: string
  company: string
  location: string
  start_date: string
  end_date?: string
  description: string
  responsibilities: string[]
}>

education: Array<{
  degree: string
  institution: string
  location: string
  graduation_date: string
  gpa?: string
  achievements?: string[]
}>

skills: Array<{
  category: string
  skills: string[]
}>
```

### Route Structure

```
app/
├── (dashboard)/    # Protected routes (home, profile, resumes, settings)
├── auth/          # Authentication flows
├── api/           # API routes for AI chat and webhooks
└── blog/          # MDX blog content
```

### Component Organization

```
src/components/
├── resume/
│   ├── assistant/  # AI chat interface
│   ├── editor/     # Resume editing components
│   └── management/ # CRUD operations
├── dashboard/      # Dashboard-specific components
└── ui/            # Shadcn UI components
```

## Key Development Patterns

### Server Components First
- Use React Server Components by default
- Client components only when needed for interactivity
- Server actions for data mutations in `/src/app/actions/`

### AI Integration
- Multi-provider support with model selector
- Structured prompts in `/src/lib/prompts.ts`
- Rate limiting via Redis (Upstash)
- Context-aware suggestions for resume optimization

### Resume Management Flow
1. Users create a **base profile** with their complete information
2. Base profiles generate **base resumes** automatically
3. Users can create **tailored resumes** for specific jobs
4. AI assists with optimization and ATS scoring

### Authentication & Security
- Supabase Auth with custom flows
- Middleware protection in `/src/middleware.ts`
- RLS policies enforce data isolation
- Subscription-based feature gating

## Important Conventions

### TypeScript
- Strict mode enabled
- Interfaces over types
- Avoid enums, use const objects or maps

### Styling
- Tailwind CSS with mobile-first approach
- CSS variables for theming
- Custom animations defined in `tailwind.config.ts`

### Data Mutations
- Use server actions, not API routes
- Handle errors with proper user feedback via toast
- Validate inputs before database operations

### Performance
- Minimize 'use client' directives
- Use dynamic imports for non-critical components
- Optimize images with WebP format
- Implement proper loading states with Suspense

## Environment Variables

Required for development:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- AI provider keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`