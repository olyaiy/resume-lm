#!/bin/sh
# Seed admin user if SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are provided

set -e

# Check if seeding is configured
if [ -z "$SEED_ADMIN_EMAIL" ] || [ -z "$SEED_ADMIN_PASSWORD" ]; then
  echo "No admin seed configured (SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set)"
  exit 0
fi

echo "Waiting for auth service to be ready..."
until curl -sf "http://auth:9999/health" > /dev/null 2>&1; do
  sleep 2
done
echo "Auth service is ready"

# Wait for Kong to be ready (any response means it's up)
echo "Waiting for Kong to be ready..."
until curl -s "http://kong:8000/auth/v1/" 2>/dev/null | grep -q "message"; do
  sleep 2
done
echo "Kong is ready"

# Wait a bit for GoTrue to finish migrations
sleep 5

# Try to sign up the user via the public signup endpoint
echo "Creating admin user: ${SEED_ADMIN_EMAIL}"

RESPONSE=$(curl -s -w "\n%{http_code}" "http://kong:8000/auth/v1/signup" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${SEED_ADMIN_EMAIL}\",
    \"password\": \"${SEED_ADMIN_PASSWORD}\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Admin user created successfully (ID: ${USER_ID})"

  if [ -n "$USER_ID" ]; then
    echo "Marking seeded user as admin..."
    ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" "http://kong:8000/rest/v1/profiles" \
      -H "apikey: ${SUPABASE_SERVICE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"user_id\": \"${USER_ID}\",
        \"email\": \"${SEED_ADMIN_EMAIL}\",
        \"is_admin\": true
      }")

    ADMIN_HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)
    if [ "$ADMIN_HTTP_CODE" = "200" ] || [ "$ADMIN_HTTP_CODE" = "201" ]; then
      echo "Admin role granted successfully"
    else
      echo "Warning: Failed to grant admin role (HTTP ${ADMIN_HTTP_CODE})"
    fi
  fi

  # Grant Pro subscription if AUTO_PRO_SUBSCRIPTION is enabled
  if [ "${AUTO_PRO_SUBSCRIPTION:-false}" = "true" ] && [ -n "$USER_ID" ]; then
    echo "Granting Pro subscription to admin user..."

    # Wait for database triggers to create the profile first
    sleep 2

    # Insert subscription via PostgREST (uses service role key to bypass RLS)
    SUB_RESPONSE=$(curl -s -w "\n%{http_code}" "http://kong:8000/rest/v1/subscriptions" \
      -H "apikey: ${SUPABASE_SERVICE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"user_id\": \"${USER_ID}\",
        \"subscription_plan\": \"pro\",
        \"subscription_status\": \"active\"
      }")

    SUB_HTTP_CODE=$(echo "$SUB_RESPONSE" | tail -n1)
    if [ "$SUB_HTTP_CODE" = "200" ] || [ "$SUB_HTTP_CODE" = "201" ]; then
      echo "Pro subscription granted successfully"
    else
      echo "Warning: Failed to grant Pro subscription (HTTP ${SUB_HTTP_CODE})"
      echo "You can manually grant it in Supabase Studio"
    fi
  fi

  echo ""
  echo "Admin user setup complete!"
  echo "Login with: ${SEED_ADMIN_EMAIL} / [your configured password]"
elif echo "$BODY" | grep -q "already been registered"; then
  echo "Admin user already exists"
else
  echo "Failed to create admin user (HTTP ${HTTP_CODE}): ${BODY}"
  # Don't exit with error - the stack should still work
fi
