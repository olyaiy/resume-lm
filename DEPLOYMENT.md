# ResumeLM Deployment Guide

This guide covers building, testing, and deploying the ResumeLM application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Docker Deployment](#docker-deployment)
5. [Health Checks](#health-checks)
6. [Testing](#testing)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.15.1
- Docker >= 24.0
- Docker Compose >= 2.20

## Environment Configuration

### Required Environment Variables

Create `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BASE_PATH=                    # Empty for root, or /app-name for subpath

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (Upstash or self-hosted)
REDIS_URL=redis://localhost:6379
USE_LOCAL_REDIS=true                      # false for Upstash

# AI Provider Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
OPENROUTER_API_KEY=sk-or-...

# Stripe (optional, for subscriptions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
```

### Port Configuration

| Service | Dev Port | Prod Port |
|---------|----------|-----------|
| Next.js App | 3021 | 3000 |
| Supabase Kong | 54327 | 8000 |
| Supabase Studio | 54323 | 3000 |
| Supabase DB | 54326 | 5432 |
| Redis | 6381 | 6379 |

## Build Process

### 1. TypeScript Compilation Check

```bash
pnpm build
```

Expected output:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**Note:** Build warnings about Redis/Stripe connections are expected during static generation. These are runtime dependencies.

### 2. Build Troubleshooting

If build fails with TypeScript errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install --frozen-lockfile

# Try build again
pnpm build
```

## Docker Deployment

### Local Docker Build

Build the production Docker image:

```bash
cd /home/vjrana/work/projects/rts-rating/repos/resume-lm

# Build production image
docker build -f docker/Dockerfile -t resumelm-app:latest --target production .

# Verify image was created
docker images | grep resumelm-app
```

Expected output:
```
resumelm-app   latest   <image-id>   X minutes ago   XXX MB
```

### Run Production Container Locally

```bash
# Run with environment file
docker run -d \
  --name resumelm-app \
  -p 3000:3000 \
  --env-file .env.production \
  resumelm-app:latest

# Check logs
docker logs -f resumelm-app

# Stop container
docker stop resumelm-app
docker rm resumelm-app
```

### Full Stack with Docker Compose

For development/staging environments:

```bash
# Start all services (dev mode)
docker-compose -f docker/docker-compose.dev.yml up -d

# Check service health
docker-compose -f docker/docker-compose.dev.yml ps

# View logs
docker-compose -f docker/docker-compose.dev.yml logs -f app

# Stop all services
docker-compose -f docker/docker-compose.dev.yml down
```

## Health Checks

### Health Check Endpoint

```bash
# Check application health
curl http://localhost:3000/api/v1/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-17T...",
  "service": "resume-lm-api",
  "environment": "production"
}
```

### Service Health Verification

```bash
# Check Next.js app
curl -f http://localhost:3000/api/v1/health || echo "App unhealthy"

# Check Supabase (if using local instance)
curl -f http://localhost:54327/rest/v1/ || echo "Supabase unhealthy"

# Check Redis
redis-cli -p 6379 ping || echo "Redis unhealthy"
```

## Testing

### API Integration Tests

Run the comprehensive API test suite:

```bash
# Test local development
./scripts/test-api.sh http://localhost:3021/api/v1

# Test production deployment
./scripts/test-api.sh https://your-domain.com/api/v1
```

The test script verifies:
- Health check endpoint
- Authentication (login)
- User profile retrieval
- Resume listing
- Job listing
- Authorization enforcement

### Manual API Testing

```bash
# 1. Health check
curl http://localhost:3000/api/v1/health

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin123"}' \
  | jq -r '.data.access_token')

# 3. Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/auth/me | jq

# 4. List resumes
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/resumes?page=1&limit=5" | jq

# 5. List jobs
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/jobs?page=1&limit=10" | jq
```

## Rollback Procedure

### Docker Rollback

```bash
# List available images
docker images resumelm-app

# Tag current version before deploy
docker tag resumelm-app:latest resumelm-app:backup-$(date +%Y%m%d-%H%M%S)

# If deployment fails, rollback
docker stop resumelm-app
docker rm resumelm-app
docker run -d \
  --name resumelm-app \
  -p 3000:3000 \
  --env-file .env.production \
  resumelm-app:backup-TIMESTAMP
```

### Database Rollback

If database migrations were applied:

```bash
# Connect to Supabase
psql $DATABASE_URL

# Check migration history
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;

# Rollback if needed (use Supabase CLI)
supabase db reset --db-url $DATABASE_URL
```

## Troubleshooting

### Build Issues

**Problem:** TypeScript compilation errors

```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
pnpm install --frozen-lockfile
pnpm build
```

**Problem:** Memory issues during build

```bash
# Solution: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Runtime Issues

**Problem:** 502 Bad Gateway / Container crashes

```bash
# Check logs
docker logs resumelm-app --tail=100

# Common causes:
# 1. Missing environment variables - check .env
# 2. Port conflicts - change port mapping
# 3. Resource limits - increase Docker memory
```

**Problem:** Database connection errors

```bash
# Verify Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  $NEXT_PUBLIC_SUPABASE_URL/rest/v1/

# Check if service role key is valid
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  $NEXT_PUBLIC_SUPABASE_URL/rest/v1/
```

**Problem:** Redis connection errors

```bash
# Test Redis connection
redis-cli -h <redis-host> -p <redis-port> ping

# If using Upstash, verify:
# - REDIS_URL format: redis://default:password@host:port
# - USE_LOCAL_REDIS=false
```

**Problem:** AI provider errors

```bash
# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Performance Issues

**Problem:** Slow API response times

```bash
# Check Redis cache hit rate
redis-cli info stats | grep keyspace

# Monitor Next.js server
docker stats resumelm-app

# Check database query performance
# Use Supabase Studio > Database > Query Performance
```

**Problem:** High memory usage

```bash
# Set memory limits in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
```

## Monitoring

### Key Metrics to Monitor

1. **Application Health**: `/api/v1/health` endpoint
2. **Response Times**: API endpoint latency
3. **Error Rates**: 4xx/5xx response codes
4. **Database Connections**: Supabase connection pool
5. **Redis Hit Rate**: Cache effectiveness
6. **Memory Usage**: Container memory consumption
7. **CPU Usage**: Container CPU utilization

### Log Aggregation

```bash
# View application logs
docker logs -f resumelm-app

# Export logs for analysis
docker logs resumelm-app > app-logs-$(date +%Y%m%d).log

# Monitor specific errors
docker logs resumelm-app 2>&1 | grep -i error
```

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Secrets are not committed to git
- [ ] CORS origins are configured properly
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced in production
- [ ] Database RLS policies are active
- [ ] API keys are rotated regularly
- [ ] Container runs as non-root user
- [ ] Security headers are configured

## Production Deployment Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] Docker image built successfully
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] API tests passing
- [ ] Rollback procedure tested
- [ ] Monitoring configured
- [ ] Team notified of deployment

## Support

For deployment issues:

1. Check logs: `docker logs resumelm-app`
2. Verify environment variables
3. Test health endpoint
4. Run API test suite
5. Check database connectivity
6. Review this troubleshooting guide

For additional help, contact the development team or create an issue in the repository.
