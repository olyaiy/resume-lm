# ResumeLM Docker Development

Run the complete ResumeLM stack locally using Docker Compose.

## Quick Start

```bash
# 1. Copy environment file and add your AI API key
cp .env.example .env.local
# Edit .env.local and add at least one: OPENAI_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY

# 2. Start Docker services
cd docker
docker compose --env-file ../.env.local up

# 3. Wait for services to be healthy (~60 seconds)
docker compose --env-file ../.env.local ps

# 4. Run the app locally (from project root)
cd ..
pnpm dev
```

**Login:** http://localhost:3000 with `admin@admin.com` / `Admin123` (Pro subscription auto-granted)

> **Tip:** All docker compose commands require `--env-file ../.env.local` to load your environment variables. This ensures both Docker and Next.js use the same config file.

## Services

| Service | URL | Description |
|---------|-----|-------------|
| **App** | http://localhost:3000 | Next.js app (run locally with `pnpm dev`) |
| **Supabase API** | http://localhost:54321 | API Gateway (Kong) |
| **Supabase Studio** | http://localhost:54323 | Database dashboard |
| **PostgreSQL** | localhost:54322 | Direct database access |
| **Redis** | localhost:6379 | Rate limiting & caching |
| **Redis Commander** | http://localhost:8081 | Redis management UI |
| **Inbucket** | http://localhost:54324 | Email testing UI |

## Full Stack Mode (Optional)

Run the Next.js app inside Docker instead of locally:

```bash
# Build and start everything including the app
docker compose --env-file ../.env.local --profile full up
```

Access the app at http://localhost:3000

## Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Admin User | admin@admin.com | Admin123 |
| Supabase Studio | supabase | supabase |
