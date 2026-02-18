#!/bin/bash

echo "=== Testing /auth/me Endpoint ==="
echo ""

# Test 1: No Authorization header
echo "Test 1: No Authorization header"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET http://192.168.1.2:3021/api/v1/auth/me)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY" | jq -c
echo "Expected: 401 with error message"
echo ""

# Test 2: Invalid header format (no Bearer)
echo "Test 2: Invalid header format (no Bearer)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET http://192.168.1.2:3021/api/v1/auth/me -H "Authorization: invalidtoken")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY" | jq -c
echo "Expected: 401 with error message"
echo ""

# Test 3: Invalid token value
echo "Test 3: Invalid token value"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET http://192.168.1.2:3021/api/v1/auth/me -H "Authorization: Bearer invalid123")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY" | jq -c
echo "Expected: 401 with error message"
echo ""

# Test 4: Valid token from login
echo "Test 4: Valid token from login"
TOKEN=$(curl -s -X POST http://192.168.1.2:3021/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin123"}' | jq -r '.data.access_token')
echo "Token obtained: ${TOKEN:0:50}..."
RESPONSE=$(timeout 10 curl -s -w "\n%{http_code}" -X GET http://192.168.1.2:3021/api/v1/auth/me -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY" | jq -c
echo "Expected: 200 with user data"
echo ""

echo "=== All Tests Complete ==="
