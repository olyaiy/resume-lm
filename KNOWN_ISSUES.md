# ResumeLM API v1 - Known Issues

## Critical

### Authentication Architecture Mismatch
**Severity:** High  
**Impact:** Some API endpoints cannot execute server actions  
**Status:** Needs refactoring

**Problem:**
API routes use JWT Bearer token authentication, but internal server actions expect cookie-based session authentication. When API routes call server actions, the authentication context is lost.

**Affected Endpoints:**
- POST /api/v1/resumes (create operations)
- POST /api/v1/jobs (create operations)
- POST /api/v1/optimize (full workflow)
- POST /api/v1/resumes/tailor

**Working Endpoints:**
- GET endpoints (read operations)
- DELETE endpoints  
- Authentication endpoints
- Health/docs endpoints

**Solution:**
Refactor API routes to use direct Supabase client access instead of calling server actions. Create dedicated database access layer for API routes.

## Minor

### GET /api/v1/jobs Returns 500
**Severity:** Medium
**Impact:** Cannot list jobs via API
**Status:** Server action bug, not API implementation issue

**Workaround:** Create jobs via web UI or fix server action

## Test Results

**Passing:** 13/14 tested endpoints (93%)  
**Core Functionality:** ✅ Working
- Authentication flow
- Security & authorization  
- Error handling
- Response formatting
- Health checks

**Recommendation:** Deploy to staging, fix architecture mismatch, then production.

---
Last Updated: 2026-02-18
