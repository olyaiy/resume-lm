#!/bin/bash
set -e

# Test script for ResumeLM API endpoints
# Usage: ./scripts/test-api.sh [base_url]

API_URL="${1:-http://localhost:3021/api/v1}"
TESTS_PASSED=0
TESTS_FAILED=0

echo "======================================"
echo "ResumeLM API Test Suite"
echo "======================================"
echo "API URL: $API_URL"
echo "Started: $(date)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  local auth=$6

  echo -n "Testing: $name... "

  local headers="-H 'Content-Type: application/json'"
  if [ -n "$auth" ]; then
    headers="$headers -H 'Authorization: Bearer $auth'"
  fi

  if [ "$method" = "GET" ]; then
    response=$(eval "curl -s -w '\n%{http_code}' $headers '$API_URL$endpoint'")
  else
    response=$(eval "curl -s -w '\n%{http_code}' -X $method $headers -d '$data' '$API_URL$endpoint'")
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
echo "===================="
echo "1. Health Check"
echo "===================="
test_endpoint "Health check" "GET" "/health" "" "200"
echo ""

# Test 2: Login (get access token)
echo "===================="
echo "2. Authentication"
echo "===================="

echo -n "Testing: Login... "
login_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "Admin123"
  }')

TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  echo "Access token obtained: ${TOKEN:0:20}..."
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  echo "Login response: $login_response"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  echo ""
  echo -e "${YELLOW}Note: Make sure admin@admin.com/Admin123 user exists${NC}"
  echo "You can create it via Supabase Studio or the seeder script"
  exit 1
fi
echo ""

# Test 3: Get current user
echo "===================="
echo "3. Get Current User"
echo "===================="
test_endpoint "Get /auth/me" "GET" "/auth/me" "" "200" "$TOKEN"
echo ""

# Test 4: List resumes
echo "===================="
echo "4. Resume Endpoints"
echo "===================="
test_endpoint "List resumes" "GET" "/resumes?page=1&limit=5" "" "200" "$TOKEN"
echo ""

# Test 5: List jobs
echo "===================="
echo "5. Job Endpoints"
echo "===================="
test_endpoint "List jobs" "GET" "/jobs?page=1&limit=5" "" "200" "$TOKEN"
echo ""

# Test 6: Get profile
echo "===================="
echo "6. Profile Endpoints"
echo "===================="
test_endpoint "Get profile" "GET" "/profiles" "" "200" "$TOKEN"
echo ""

# Test 7: Unauthorized access
echo "===================="
echo "7. Authorization"
echo "===================="
test_endpoint "Unauthorized access" "GET" "/resumes" "" "401"
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Total tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Completed: $(date)"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
