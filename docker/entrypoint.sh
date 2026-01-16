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

# Handle basePath substitution
# The placeholder /__NEXT_BASEPATH_PLACEHOLDER__ is replaced with actual basePath or removed
inject_basepath() {
  local placeholder="/__NEXT_BASEPATH_PLACEHOLDER__"
  local basepath="${NEXT_PUBLIC_BASE_PATH:-}"

  if [ -n "$basepath" ]; then
    echo "Injecting basePath: $basepath"
    export NEXT_PUBLIC_BASE_PATH="$basepath"
    # Replace placeholder in .next directory (js, html, css for fonts/assets)
    find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" \) -exec sed -i "s|$placeholder|$basepath|g" {} + 2>/dev/null || true
    # Replace in standalone server.js
    sed -i "s|$placeholder|$basepath|g" /app/server.js 2>/dev/null || true
  else
    echo "Removing basePath placeholder (serving at root)"
    export NEXT_PUBLIC_BASE_PATH=""
    # Remove placeholder in .next directory (js, html, css for fonts/assets)
    find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" \) -exec sed -i "s|$placeholder||g" {} + 2>/dev/null || true
    # Remove in standalone server.js
    sed -i "s|$placeholder||g" /app/server.js 2>/dev/null || true
  fi
}

# Inject basePath first (order matters for routing)
inject_basepath

# Inject all NEXT_PUBLIC_* variables
inject_env "__NEXT_PUBLIC_SUPABASE_URL__" "NEXT_PUBLIC_SUPABASE_URL"
inject_env "__NEXT_PUBLIC_SUPABASE_ANON_KEY__" "NEXT_PUBLIC_SUPABASE_ANON_KEY"
inject_env "__NEXT_PUBLIC_SITE_URL__" "NEXT_PUBLIC_SITE_URL"
inject_env "__NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY__" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
inject_env "__NEXT_PUBLIC_STRIPE_PRO_PRICE_ID__" "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID"

echo "Environment injection complete"

# Execute the main command
exec "$@"
