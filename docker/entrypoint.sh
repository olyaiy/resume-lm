#!/bin/sh
set -e

# Runtime environment variable injection for Next.js
# Replaces build-time placeholders with actual runtime values

# Define placeholder -> env var mappings
inject_env() {
  local placeholder="$1"
  local env_var="$2"
  local value=$(eval echo \$$env_var)

  if [ -n "$value" ]; then
    echo "Injecting $env_var"
    # Replace in all JS files in .next directory
    find /app/.next -type f -name "*.js" -exec sed -i "s|$placeholder|$value|g" {} + 2>/dev/null || true
  fi
}

# Inject all NEXT_PUBLIC_* variables
inject_env "__NEXT_PUBLIC_SUPABASE_URL__" "NEXT_PUBLIC_SUPABASE_URL"
inject_env "__NEXT_PUBLIC_SUPABASE_ANON_KEY__" "NEXT_PUBLIC_SUPABASE_ANON_KEY"
inject_env "__NEXT_PUBLIC_SITE_URL__" "NEXT_PUBLIC_SITE_URL"
inject_env "__NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY__" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
inject_env "__NEXT_PUBLIC_STRIPE_PRO_PRICE_ID__" "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID"

echo "Environment injection complete"

# Execute the main command
exec "$@"
