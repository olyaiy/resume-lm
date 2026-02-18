#!/bin/bash
set -e

# Comprehensive Test script for ResumeLM API endpoints
# Usage: ./scripts/test-api-comprehensive.sh [base_url]

API_URL="${1:-http://localhost:3021/api/v1}"
TESTS_PASSED=0
TESTS_FAILED=0

echo "=========================================="
echo "ResumeLM Comprehensive API Test Suite"
echo "=========================================="
echo "API URL: $API_URL"
echo "Started: $(date)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  local auth=$6

  echo -n "Testing: $name... "

  local http_code
  local body

  if [ "$method" = "GET" ]; then
    if [ -n "$auth" ]; then
      response=$(curl -s -w '\n%{http_code}' \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $auth" \
        "$API_URL$endpoint")
    else
      response=$(curl -s -w '\n%{http_code}' \
        -H "Content-Type: application/json" \
        "$API_URL$endpoint")
    fi
  else
    if [ -n "$auth" ]; then
      response=$(curl -s -w '\n%{http_code}' \
        -X "$method" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $auth" \
        -d "$data" \
        "$API_URL$endpoint")
    else
      response=$(curl -s -w '\n%{http_code}' \
        -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$API_URL$endpoint")
    fi
  fi

  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test 1: Health Check
echo "=========================================="
echo "1. Health Check"
echo "=========================================="
test_endpoint "Health check" "GET" "/health" "" "200"
echo ""

# Test 2: Authentication Endpoints
echo "=========================================="
echo "2. Authentication Endpoints (4)"
echo "=========================================="

echo -n "Testing: POST /auth/login... "
login_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin123"}')

# Use jq to extract token properly
TOKEN=$(echo "$login_response" | jq -r '.data.access_token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  echo "  Access token: ${TOKEN:0:30}... (length: ${#TOKEN})"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  echo "  Login response: $login_response"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  echo ""
  echo -e "${YELLOW}Note: Make sure admin@admin.com/Admin123 user exists${NC}"
  exit 1
fi

test_endpoint "GET /auth/me" "GET" "/auth/me" "" "200" "$TOKEN"
test_endpoint "POST /auth/refresh" "POST" "/auth/refresh" "{\"refresh_token\":\"test\"}" "401"
test_endpoint "POST /auth/logout" "POST" "/auth/logout" "" "200" "$TOKEN"
echo ""

# Re-login after logout
echo -n "Re-authenticating... "
login_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin123"}')
TOKEN=$(echo "$login_response" | jq -r '.data.access_token // empty')
echo -e "${GREEN}✓${NC}"
echo ""

# Test 3: Resume Endpoints
echo "=========================================="
echo "3. Resume Endpoints (7)"
echo "=========================================="
test_endpoint "GET /resumes (list)" "GET" "/resumes?page=1&limit=5" "" "200" "$TOKEN"
test_endpoint "GET /resumes (filtered)" "GET" "/resumes?type=base" "" "200" "$TOKEN"
# Note: CREATE, UPDATE, DELETE, SCORE, TAILOR would require actual data
echo -e "${BLUE}ℹ INFO:${NC} Skipping CREATE/UPDATE/DELETE/SCORE/TAILOR - require test data"
echo ""

# Test 4: Job Endpoints
echo "=========================================="
echo "4. Job Endpoints (5)"
echo "=========================================="
test_endpoint "GET /jobs (list)" "GET" "/jobs?page=1&limit=5" "" "200" "$TOKEN"
test_endpoint "GET /jobs (filtered)" "GET" "/jobs?workLocation=remote" "" "200" "$TOKEN"
# Note: CREATE, UPDATE, DELETE would require actual data
echo -e "${BLUE}ℹ INFO:${NC} Skipping CREATE/UPDATE/DELETE - require test data"
echo ""

# Test 5: Profile Endpoints
echo "=========================================="
echo "5. Profile Endpoints (3)"
echo "=========================================="
test_endpoint "GET /profiles (own)" "GET" "/profiles" "" "200" "$TOKEN"
# Note: UPDATE would modify data, admin endpoint requires admin user
echo -e "${BLUE}ℹ INFO:${NC} Skipping UPDATE and admin GET - require special setup"
echo ""

# Test 6: Authorization Tests
echo "=========================================="
echo "6. Authorization Tests"
echo "=========================================="
test_endpoint "Unauthorized /resumes" "GET" "/resumes" "" "401"
test_endpoint "Unauthorized /jobs" "GET" "/jobs" "" "401"
test_endpoint "Unauthorized /profiles" "GET" "/profiles" "" "401"
test_endpoint "Invalid token" "GET" "/auth/me" "" "401" "invalid-token"
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total tests run: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Completed: $(date)"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed!${NC}"
  exit 1
fi
