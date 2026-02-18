#!/bin/bash

# ResumeLM API v1 - Comprehensive Endpoint Testing
# Tests all 26 endpoints on production deployment

set +e

API_URL="http://192.168.1.2:3020/api/v1"
RESULTS_FILE="tmp/e2e-test-results.json"
mkdir -p tmp

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Results array
declare -a RESULTS

# Test tracking
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local headers="$6"

    TOTAL=$((TOTAL + 1))
    echo -e "\n${YELLOW}[$TOTAL]${NC} Testing: $method $endpoint"

    if [ -z "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"} 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "$headers" \
            ${data:+-d "$data"} 2>&1)
    fi

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} - Status: $status_code"
        PASSED=$((PASSED + 1))
        RESULTS+=("✅ $name")
        echo "$body" | jq -c . 2>/dev/null || echo "$body"
        return 0
    else
        echo -e "  ${RED}✗ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        FAILED=$((FAILED + 1))
        RESULTS+=("❌ $name (Expected $expected_status, got $status_code)")
        echo "$body" | jq -c . 2>/dev/null || echo "$body"
        return 1
    fi
}

echo "======================================="
echo "ResumeLM API v1 - E2E Testing Suite"
echo "======================================="
echo "Target: $API_URL"
echo "Started: $(date)"
echo ""

# Store created resource IDs
JOB_ID=""
BASE_RESUME_ID=""
TAILORED_RESUME_ID=""
COVER_LETTER_ID=""

echo -e "\n${YELLOW}=== SYSTEM ENDPOINTS ===${NC}"

# 1. Health Check
test_endpoint "Health Check" "GET" "/health" "" "200"

# 2. API Documentation
test_endpoint "API Documentation" "GET" "/docs" "" "200"

echo -e "\n${YELLOW}=== AUTHENTICATION ENDPOINTS ===${NC}"

# 3. Login
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@admin.com","password":"Admin123"}')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // empty')

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo -e "  ${GREEN}✓ PASS${NC} - Login successful"
    PASSED=$((PASSED + 1))
    TOTAL=$((TOTAL + 1))
    RESULTS+=("✅ POST /auth/login")
    echo "  Token length: ${#ACCESS_TOKEN}"
else
    echo -e "  ${RED}✗ FAIL${NC} - Login failed"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
    RESULTS+=("❌ POST /auth/login")
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

# 4. Get Current User
test_endpoint "Get Current User" "GET" "/auth/me" "" "200" "$AUTH_HEADER"

# 5. Refresh Token
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.refresh_token // empty')
if [ -n "$REFRESH_TOKEN" ] && [ "$REFRESH_TOKEN" != "null" ]; then
    test_endpoint "Refresh Token" "POST" "/auth/refresh" "{\"refresh_token\":\"$REFRESH_TOKEN\"}" "200"
else
    echo "  ${YELLOW}⚠ SKIP${NC} - No refresh token available"
fi

# 6. Logout (will invalidate current session, so we skip for now)
echo -e "\n  ${YELLOW}⚠ SKIP${NC} - POST /auth/logout (would invalidate session)"

echo -e "\n${YELLOW}=== PROFILE ENDPOINTS ===${NC}"

# 7. Get Profile
test_endpoint "Get User Profile" "GET" "/profiles" "" "200" "$AUTH_HEADER"

# 8. Update Profile (we'll skip to avoid modifying production data)
echo -e "\n  ${YELLOW}⚠ SKIP${NC} - PATCH /profiles (would modify production data)"

echo -e "\n${YELLOW}=== JOB ENDPOINTS ===${NC}"

# 9. Create Job
CREATE_JOB_RESPONSE=$(curl -s -X POST "$API_URL/jobs" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{
        "company_name": "E2E Test Company",
        "position_title": "Senior Software Engineer",
        "description": "E2E testing position - full stack development",
        "location": "Remote",
        "work_location": "remote",
        "employment_type": "full_time",
        "salary_range": "$120k-$180k",
        "keywords": ["TypeScript", "React", "Node.js", "PostgreSQL"]
    }')

JOB_ID=$(echo "$CREATE_JOB_RESPONSE" | jq -r '.data.job.id // empty')

if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    echo -e "  ${GREEN}✓ PASS${NC} - POST /jobs"
    PASSED=$((PASSED + 1))
    TOTAL=$((TOTAL + 1))
    RESULTS+=("✅ POST /jobs")
    echo "  Created Job ID: $JOB_ID"
else
    echo -e "  ${RED}✗ FAIL${NC} - POST /jobs"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
    RESULTS+=("❌ POST /jobs")
    echo "Response: $CREATE_JOB_RESPONSE"
fi

# 10. List Jobs
test_endpoint "List Jobs" "GET" "/jobs?page=1&limit=10" "" "200" "$AUTH_HEADER"

# 11. Get Job by ID
if [ -n "$JOB_ID" ]; then
    test_endpoint "Get Job by ID" "GET" "/jobs/$JOB_ID" "" "200" "$AUTH_HEADER"
else
    echo -e "  ${YELLOW}⚠ SKIP${NC} - GET /jobs/:id (no job created)"
fi

# 12. Update Job
if [ -n "$JOB_ID" ]; then
    test_endpoint "Update Job" "PATCH" "/jobs/$JOB_ID" \
        "{\"description\":\"Updated E2E test description\"}" "200" "$AUTH_HEADER"
else
    echo -e "  ${YELLOW}⚠ SKIP${NC} - PATCH /jobs/:id (no job created)"
fi

echo -e "\n${YELLOW}=== RESUME ENDPOINTS ===${NC}"

# 13. Create Base Resume
CREATE_RESUME_RESPONSE=$(curl -s -X POST "$API_URL/resumes" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{
        "name": "E2E Test Base Resume",
        "importOption": "fresh",
        "selectedContent": {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone_number": "+1234567890",
            "location": "San Francisco, CA",
            "work_experience": [
                {
                    "position": "Software Engineer",
                    "company": "Tech Corp",
                    "location": "Remote",
                    "start_date": "2020-01",
                    "end_date": "2023-12",
                    "description": "Full stack development",
                    "responsibilities": ["Built features", "Reviewed code"]
                }
            ],
            "education": [
                {
                    "degree": "BS Computer Science",
                    "institution": "University",
                    "location": "CA",
                    "graduation_date": "2020-05"
                }
            ],
            "skills": [
                {
                    "category": "Programming",
                    "skills": ["JavaScript", "TypeScript", "Python"]
                }
            ]
        }
    }')

BASE_RESUME_ID=$(echo "$CREATE_RESUME_RESPONSE" | jq -r '.data.resume.id // empty')

if [ -n "$BASE_RESUME_ID" ] && [ "$BASE_RESUME_ID" != "null" ]; then
    echo -e "  ${GREEN}✓ PASS${NC} - POST /resumes"
    PASSED=$((PASSED + 1))
    TOTAL=$((TOTAL + 1))
    RESULTS+=("✅ POST /resumes")
    echo "  Created Base Resume ID: $BASE_RESUME_ID"
else
    echo -e "  ${RED}✗ FAIL${NC} - POST /resumes"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
    RESULTS+=("❌ POST /resumes")
    echo "Response: $CREATE_RESUME_RESPONSE"
fi

# 14. List Resumes
test_endpoint "List Resumes (all)" "GET" "/resumes?type=all&page=1&limit=10" "" "200" "$AUTH_HEADER"

# 15. List Base Resumes
test_endpoint "List Base Resumes" "GET" "/resumes?type=base&page=1&limit=10" "" "200" "$AUTH_HEADER"

# 16. List Tailored Resumes
test_endpoint "List Tailored Resumes" "GET" "/resumes?type=tailored&page=1&limit=10" "" "200" "$AUTH_HEADER"

# 17. Get Resume by ID
if [ -n "$BASE_RESUME_ID" ]; then
    test_endpoint "Get Resume by ID" "GET" "/resumes/$BASE_RESUME_ID" "" "200" "$AUTH_HEADER"
else
    echo -e "  ${YELLOW}⚠ SKIP${NC} - GET /resumes/:id (no resume created)"
fi

# 18. Update Resume
if [ -n "$BASE_RESUME_ID" ]; then
    test_endpoint "Update Resume" "PATCH" "/resumes/$BASE_RESUME_ID" \
        "{\"name\":\"Updated E2E Test Resume\"}" "200" "$AUTH_HEADER"
else
    echo -e "  ${YELLOW}⚠ SKIP${NC} - PATCH /resumes/:id (no resume created)"
fi

# 19. Score Resume
if [ -n "$BASE_RESUME_ID" ] && [ -n "$JOB_ID" ]; then
    test_endpoint "Score Resume" "POST" "/resumes/$BASE_RESUME_ID/score" \
        "{\"job_id\":\"$JOB_ID\"}" "200" "$AUTH_HEADER"
else
    echo -e "  ${YELLOW}⚠ SKIP${NC} - POST /resumes/:id/score (missing resume or job)"
fi

# 20. Tailor Resume
if [ -n "$BASE_RESUME_ID" ] && [ -n "$JOB_ID" ]; then
    echo -e "\n${YELLOW}[$TOTAL]${NC} Testing: POST /resumes/tailor"
    TOTAL=$((TOTAL + 1))
    echo "  Note: This endpoint uses AI and may take 30-60 seconds..."

    TAILOR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/resumes/tailor" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{\"base_resume_id\":\"$BASE_RESUME_ID\",\"job_id\":\"$JOB_ID\",\"generate_score\":false}" \
        --max-time 120 2>&1)

    status_code=$(echo "$TAILOR_RESPONSE" | tail -n1)
    body=$(echo "$TAILOR_RESPONSE" | head -n-1)

    if [ "$status_code" = "201" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} - Status: $status_code"
        PASSED=$((PASSED + 1))
        RESULTS+=("✅ POST /resumes/tailor")
        TAILORED_RESUME_ID=$(echo "$body" | jq -r '.data.resume.id // empty')
        echo "  Created Tailored Resume ID: $TAILORED_RESUME_ID"
    else
        echo -e "  ${RED}✗ FAIL${NC} - Expected: 201, Got: $status_code"
        FAILED=$((FAILED + 1))
        RESULTS+=("❌ POST /resumes/tailor")
        echo "$body" | jq -c . 2>/dev/null || echo "$body"
    fi
else
    echo -e "\n  ${YELLOW}⚠ SKIP${NC} - POST /resumes/tailor (missing resume or job)"
fi

echo -e "\n${YELLOW}=== COVER LETTER ENDPOINTS ===${NC}"

# 21. Create Cover Letter
if [ -n "$BASE_RESUME_ID" ] && [ -n "$JOB_ID" ]; then
    echo -e "\n${YELLOW}[$TOTAL]${NC} Testing: POST /cover-letters"
    TOTAL=$((TOTAL + 1))
    echo "  Note: This endpoint uses AI and may take 20-40 seconds..."

    CL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/cover-letters" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{\"resume_id\":\"$BASE_RESUME_ID\",\"job_id\":\"$JOB_ID\"}" \
        --max-time 90 2>&1)

    status_code=$(echo "$CL_RESPONSE" | tail -n1)
    body=$(echo "$CL_RESPONSE" | head -n-1)

    if [ "$status_code" = "201" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} - Status: $status_code"
        PASSED=$((PASSED + 1))
        RESULTS+=("✅ POST /cover-letters")
        COVER_LETTER_ID=$(echo "$body" | jq -r '.data.cover_letter.id // empty')
        echo "  Created Cover Letter ID: $COVER_LETTER_ID"
    else
        echo -e "  ${RED}✗ FAIL${NC} - Expected: 201, Got: $status_code"
        FAILED=$((FAILED + 1))
        RESULTS+=("❌ POST /cover-letters")
        echo "$body" | jq -c . 2>/dev/null || echo "$body"
    fi
else
    echo -e "\n  ${YELLOW}⚠ SKIP${NC} - POST /cover-letters (missing resume or job)"
fi

# 22. List Cover Letters
test_endpoint "List Cover Letters" "GET" "/cover-letters" "" "200" "$AUTH_HEADER"

# 23. Get Cover Letter by ID
if [ -n "$COVER_LETTER_ID" ]; then
    test_endpoint "Get Cover Letter by ID" "GET" "/cover-letters/$COVER_LETTER_ID" "" "200" "$AUTH_HEADER"
else
    echo -e "  ${YELLOW}⚠ SKIP${NC} - GET /cover-letters/:id (no cover letter created)"
fi

echo -e "\n${YELLOW}=== OPTIMIZATION ENDPOINTS ===${NC}"

# 24. Optimize Resume (full workflow)
echo -e "\n  ${YELLOW}⚠ SKIP${NC} - POST /optimize (would take 2-5 minutes, tested separately)"

# 25. Optimize Chat
echo -e "\n  ${YELLOW}⚠ SKIP${NC} - POST /optimize/chat (interactive, tested separately)"

echo -e "\n${YELLOW}=== CLEANUP ===${NC}"

# Delete created resources
if [ -n "$COVER_LETTER_ID" ]; then
    test_endpoint "Delete Cover Letter" "DELETE" "/cover-letters/$COVER_LETTER_ID" "" "200" "$AUTH_HEADER"
fi

if [ -n "$TAILORED_RESUME_ID" ]; then
    test_endpoint "Delete Tailored Resume" "DELETE" "/resumes/$TAILORED_RESUME_ID" "" "200" "$AUTH_HEADER"
fi

if [ -n "$BASE_RESUME_ID" ]; then
    test_endpoint "Delete Base Resume" "DELETE" "/resumes/$BASE_RESUME_ID" "" "200" "$AUTH_HEADER"
fi

if [ -n "$JOB_ID" ]; then
    test_endpoint "Delete Job" "DELETE" "/jobs/$JOB_ID" "" "200" "$AUTH_HEADER"
fi

echo -e "\n======================================="
echo "TEST SUMMARY"
echo "======================================="
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "Success Rate: $(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%"
echo ""
echo "Completed: $(date)"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Failed Tests:"
    for result in "${RESULTS[@]}"; do
        if [[ $result == ❌* ]]; then
            echo "  $result"
        fi
    done
    exit 1
fi
