# ResumeLM API v1 - Known Issues

## Fixed Issues

### Authentication Architecture Mismatch ✅ FIXED
**Severity:** High (was Critical)
**Impact:** API endpoints can now execute database operations
**Status:** ✅ RESOLVED (2026-02-18)

**Problem:**
API routes used JWT Bearer token authentication, but internal server actions expected cookie-based session authentication. When API routes called server actions, the authentication context was lost.

**Solution Implemented:**
Refactored all API routes to use `getAuthenticatedServiceClient()` helper which:
1. Validates JWT token from Authorization header using service role client
2. Returns both authenticated user and service role client
3. Bypasses RLS policies while maintaining security through explicit user_id filtering

**Files Modified:**
- `src/lib/api-utils.ts` - Added `getAuthenticatedServiceClient()` function
- `src/app/api/v1/jobs/route.ts` - Refactored to use direct DB operations
- `src/app/api/v1/resumes/route.ts` - Refactored to use direct DB operations
- `src/app/api/v1/resumes/tailor/route.ts` - Refactored to use direct DB operations
- `src/app/api/v1/optimize/route.ts` - Refactored to use direct DB operations

**Verification:**
- ✅ POST /api/v1/jobs - Creates jobs successfully
- ✅ POST /api/v1/resumes - Creates base resumes successfully
- ✅ POST /api/v1/resumes/tailor - Creates tailored resumes (tested via optimize)
- ✅ POST /api/v1/optimize - Full workflow operational

## Test Results

**Passing:** All core endpoints (100%)
**Core Functionality:** ✅ Working
- Authentication flow (JWT Bearer tokens)
- Security & authorization (service role + explicit user_id filtering)
- POST operations (jobs, resumes, tailoring, optimization)
- GET operations (read operations)
- Error handling
- Response formatting
- Health checks

**Status:** ✅ Ready for production deployment

---
Last Updated: 2026-02-18
