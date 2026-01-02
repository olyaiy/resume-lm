# ResumeLM Dockerfile
# Multi-stage build for development and production

# ==========================================
# Build base - includes build tools for native modules
# ==========================================
FROM node:22-slim AS build-base

# Install build dependencies for node-gyp and canvas
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    libjpeg-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pin pnpm version for reproducibility
ARG PNPM_VERSION=9.15.1
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# ==========================================
# Dependencies stage
# ==========================================
FROM build-base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ==========================================
# Development stage
# ==========================================
FROM build-base AS development

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files (needed for pnpm commands)
COPY package.json pnpm-lock.yaml ./

# Copy config files (changes less frequently = better caching)
COPY next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs ./
COPY components.json eslint.config.mjs ./

# Copy source and assets
COPY src ./src
COPY public ./public
COPY content ./content

EXPOSE 3000

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "dev"]

# ==========================================
# Builder stage
# ==========================================
FROM build-base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files (needed for pnpm build)
COPY package.json pnpm-lock.yaml ./

# Copy config files (changes less frequently = better caching)
COPY next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs ./
COPY components.json eslint.config.mjs ./

# Copy source and assets
COPY src ./src
COPY public ./public
COPY content ./content

# Base path for serving app at a subpath (e.g., /resumelm)
# This is baked into the build and cannot be changed at runtime
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

# Build with placeholder values - replaced at runtime by entrypoint.sh
# This allows a single image to work across all environments
ENV NEXT_PUBLIC_SUPABASE_URL="__NEXT_PUBLIC_SUPABASE_URL__" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="__NEXT_PUBLIC_SUPABASE_ANON_KEY__" \
    NEXT_PUBLIC_SITE_URL="__NEXT_PUBLIC_SITE_URL__" \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="__NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY__" \
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="__NEXT_PUBLIC_STRIPE_PRO_PRICE_ID__" \
    NEXT_TELEMETRY_DISABLED=1

# Stripe key for build-time page pre-rendering (use placeholder)
ENV STRIPE_SECRET_KEY="sk_placeholder_for_build"

# Build the application
RUN pnpm build

# ==========================================
# Production stage - minimal runtime image
# ==========================================
FROM node:22-slim AS production

# OCI labels for container metadata
LABEL org.opencontainers.image.title="ResumeLM" \
      org.opencontainers.image.description="AI-powered resume builder" \
      org.opencontainers.image.vendor="ResumeLM" \
      org.opencontainers.image.source="https://github.com/resumelm/resumelm"

# Install ONLY runtime libraries for canvas (not -dev packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    libjpeg62-turbo \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy entrypoint script (must be before USER switch, owned by root, executable by all)
COPY --chmod=755 docker/entrypoint.sh /entrypoint.sh

# Copy built application from builder (owned by nextjs for write access during env injection)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check for container orchestration (k8s, compose, etc.)
# Uses TCP check since no dedicated health endpoint exists
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('net').createConnection(3000, 'localhost').on('connect', () => process.exit(0)).on('error', () => process.exit(1))"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
