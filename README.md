# ResumeLM - Free AI Resume Builder | Create ATS-Optimized Resumes in Minutes

<div align="center">

![ResumeLM Logo](public/og.webp)

**🚀 An open-source AI resume builder for tech job applications**

![Status: Sunset October 2026](https://img.shields.io/badge/Status-Sunset_Oct_2026-orange?style=for-the-badge)
[![GitHub Stars](https://img.shields.io/github/stars/olyaiy/resume-lm?style=for-the-badge)](https://github.com/olyaiy/resume-lm/stargazers)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

</div>

> [!IMPORTANT]
> **ResumeLM was sunset in October 2026.**
>
> - The hosted app at resumelm.ca shuts down on **October 31, 2026**. If you have an account, download any resumes you want to keep before then.
> - Paid plans are closed and nobody will be charged again.
> - The code stays here under AGPL-3.0. You are welcome to fork it, self-host it, and build on it (see [Installation & Setup](#-installation--setup)).
> - This repository is archived and read-only, so there will be no further updates, and issues and pull requests are closed.
>
> Thank you to everyone who used ResumeLM, starred the repo, and contributed. 🙏

> [!WARNING]
> **Self-hosting with Docker or Helm?** Earlier versions shipped Supabase's public demo `JWT_SECRET`, `ANON_KEY`, and `SERVICE_ROLE_KEY` as fallbacks ([#90](https://github.com/olyaiy/resume-lm/issues/90)). Anyone who knows those values can forge admin tokens against your Supabase API. The fallbacks are removed and the stack now refuses to start without your own keys. If you deployed with the defaults, generate new ones with `node scripts/generate-supabase-keys.mjs` and rotate all three.

## 📊 Product facts

ResumeLM is open source and self-hostable, and supports your own AI provider keys. The hosted version at resumelm.ca and its Pro plan were sunset in October 2026.

## 🎯 Why Choose ResumeLM?

**ResumeLM** is an open-source AI resume builder that helps job seekers create professional, ATS-aware resumes and tailored versions for specific applications.

## ✨ Key Features & Screenshots

### 🤖 AI-Powered Resume Assistant
![AI Resume Assistant](public/SS%20Chat.png)

**AI-assisted bullet editing**
- Smart content suggestions based on your experience
- Real-time feedback on your resume content
- Industry-specific optimization for better results
- ATS-friendly formatting and keyword optimization

### 📊 Beautiful Resume Dashboard
![Resume Dashboard](public/Dashboard%20Image.png)

**Organize Your Entire Job Search**
- Centralized resume management system
- Create base resumes and tailored versions

### 📈 Resume Performance Scoring
![Resume Scoring](public/SS%20Score.png)

**Resume performance feedback**
- ATS compatibility scoring and analysis
- Keyword optimization insights
- Detailed improvement recommendations
- Performance metrics and analytics

### 📝 AI Cover Letter Generator
![Cover Letter Generator](public/SS%20Cover%20Letter.png)

**Save 30+ Minutes Per Application**
- Tailored to match specific job requirements
- Professional tone and structure
- Highlights your relevant achievements
- Personalized for each opportunity

## 🚀 Getting Started

The hosted demo is being retired on October 31, 2026. To keep using ResumeLM, self-host it with the steps below.

## 🛠️ Complete Tech Stack

### Frontend & UI
- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React features and optimizations
- **TypeScript** - Type-safe development
- **Shadcn UI** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### AI & Intelligence
- **OpenAI GPT** - Advanced content generation
- **Claude AI** - Alternative AI model support
- **Gemini AI** - Google's AI integration
- **DeepSeek** - Cost-effective AI processing
- **Groq** - High-speed AI inference

### Backend & Database
- **PostgreSQL** - Robust relational database
- **Supabase** - Backend-as-a-Service with auth
- **Row Level Security** - Enterprise-grade security

### Additional Features
- **React PDF** - Professional PDF generation
- **Stripe Integration** - Secure payment processing
- **Real-time Updates** - Live preview and editing
- **Mobile Responsive** - Works on all devices

## 📱 Mobile-First Design

ResumeLM is built with a mobile-first approach, ensuring your resume building experience is seamless across all devices:

- 📱 **Mobile Optimized** - Full functionality on smartphones
- 💻 **Desktop Enhanced** - Rich editing experience on larger screens
- 🎨 **Responsive Design** - Adapts to any screen size
- ⚡ **Fast Loading** - Optimized for performance

## 🎨 Modern Design System

### Visual Design Principles
- **Layered Depth** - Multiple translucent layers create visual hierarchy
- **Organic Motion** - Subtle animations suggest liveliness without distraction
- **Purposeful White Space** - Generous spacing improves content digestion
- **Consistent Interaction** - Predictable hover and active states
- **Gradient Aesthetics** - Soft, professional color schemes

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database
- Supabase account

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/olyaiy/resume-lm.git
cd resume-lm
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
# Database
DATABASE_URL=your_postgresql_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENROUTER_API_KEY=your_openrouter_key
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_AI_API_KEY=your_gemini_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Payments (Optional)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_public
```

5. **Database setup**
```bash
# Run the schema.sql file in your Supabase SQL editor
# Or use the Supabase CLI:
supabase db push --db-url=your_supabase_db_url schema.sql
```

6. **Start development server**
```bash
pnpm dev
```

Visit `http://localhost:3000` to see your local ResumeLM instance!

### 🐳 Docker Setup (Alternative)

Run the complete stack locally with Docker Compose - includes Supabase, PostgreSQL, Redis, and all services:

```bash
# 1. Copy environment file and add your AI API key
cp .env.example .env.local
# Edit .env.local and add OPENROUTER_API_KEY for ResumeLM's default models

# Generate a unique JWT secret and matching Supabase keys (required)
node scripts/generate-supabase-keys.mjs .env.local

# 2. Start Docker services
cd docker
docker compose --env-file ../.env.local up -d

# 3. Wait for services to be healthy (~60 seconds)
docker compose --env-file ../.env.local ps

# 4. Run the app locally (from project root)
cd ..
pnpm dev
```

**Login:** http://localhost:3000 and create a local account with credentials you control. Do not reuse example credentials in development or production.

| Service | URL | Description |
|---------|-----|-------------|
| **App** | http://localhost:3000 | Next.js application |
| **Supabase API** | http://localhost:54321 | API Gateway |
| **Supabase Studio** | http://localhost:54323 | Database dashboard |
| **Redis Commander** | http://localhost:8081 | Redis management UI |

> 📖 See [docker/DOCKER.md](docker/DOCKER.md) for full Docker documentation including full-stack mode.

## 📊 Database Architecture

### Core Tables Structure

#### Profiles Table
- Stores user's base information and resume components
- JSON fields for complex data (work_experience, education, skills)
- One-to-one relationship with auth.users

#### Resumes Table
- Base and tailored resume versions
- Links to jobs for targeted applications
- JSONB for section_order and section_configs
- Version control and tracking

#### Jobs Table
- Job listings with requirements and details
- Salary range as flexible JSONB structure
- Application status tracking

### Security Features
- **Row Level Security (RLS)** - Users only access their own data
- **Authentication Integration** - Secure user management
- **Data Encryption** - Sensitive information protection

## 🌟 Key Benefits for Job Seekers

### For Individual Users
- ✅ **Free Forever** - Core features always free
- ✅ **No Hidden Costs** - Transparent pricing
- ✅ **ATS Optimization** - Beat applicant tracking systems
- ✅ **Multiple Formats** - PDF, Word, and web formats
- ✅ **Industry Templates** - Tailored for different fields

### For Developers
- ✅ **Open Source** - Full access to source code
- ✅ **Modern Stack** - Latest technologies and best practices
- ✅ **Extensible** - Easy to customize and extend
- ✅ **Well Documented** - Comprehensive documentation
- ✅ **Forkable** - Archived, but free to fork and self-host under AGPL-3.0

## 🎯 SEO Keywords & Use Cases

**Primary Keywords:** AI resume builder, free resume maker, ATS-optimized resume, professional resume template, job application tool

**Use Cases:**
- Recent graduates entering the job market
- Career changers looking to pivot industries
- Professionals seeking advancement opportunities
- Freelancers building their personal brand
- Anyone wanting to improve their resume quality

## 📈 Performance & Analytics

### Current product notes
- Public pages include structured metadata and a sitemap.
- The free plan stores entered provider keys in the browser's local storage.
- ATS behavior and interview outcomes vary by employer; the product does not guarantee a hiring result.

## 🔮 Roadmap

ResumeLM is no longer in active development. Ideas that were on the list (LinkedIn sync, interview prep, more templates, a job tracker) are fair game for forks.

## 🤝 Contributing

This repository is archived, so it no longer accepts issues or pull requests. To keep building on ResumeLM, fork it and take it wherever you like.

## 📄 License & Legal

**GNU Affero General Public License v3 (AGPL-3.0)**

### License Summary
- ✅ **Commercial Use** - Use in commercial projects
- ✅ **Modification** - Modify and distribute changes
- ✅ **Distribution** - Share the software freely
- ✅ **Patent Use** - Use any patents in the software
- ❗ **Disclose Source** - Must provide source code
- ❗ **License Notice** - Include license and copyright notice
- ❗ **Network Use** - Network use is considered distribution
- ❗ **Same License** - Derivative works must use same license

### Commercial Licensing
For businesses requiring proprietary licenses or commercial support, please contact us for custom licensing arrangements.


---

<div align="center">

**Fork it, self-host it, make it yours.**

[![View Source Code](https://img.shields.io/badge/📚_View_Source-GitHub-black?style=for-the-badge&logo=github)](https://github.com/olyaiy/resume-lm)

**Built with ❤️ using Next.js**

</div>
