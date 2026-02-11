import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASEPATH_PLACEHOLDER = '/__NEXT_BASEPATH_PLACEHOLDER__';

/**
 * Get the base path for the application.
 * Used for constructing URLs that bypass Next.js router (e.g., window.location.href, fetch).
 * 
 * IMPORTANT: Uses a placeholder that gets replaced at runtime by entrypoint.sh.
 * The placeholder /__NEXT_BASEPATH_PLACEHOLDER__ is replaced with the actual
 * NEXT_PUBLIC_BASE_PATH value when the container starts.
 */
export function getBasePath(): string {
  // Prefer explicit env var when available (local dev, Vercel, or runtime-injected Docker)
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
  if (envBasePath && envBasePath !== BASEPATH_PLACEHOLDER) {
    return envBasePath;
  }

  // Fallback to Next runtime data when available in the browser
  if (typeof window !== 'undefined') {
    const runtimeBasePath = (window.__NEXT_DATA__ as { basePath?: string } | undefined)?.basePath;
    if (runtimeBasePath && runtimeBasePath !== BASEPATH_PLACEHOLDER) {
      return runtimeBasePath;
    }
  }

  // Default to root when unset or when the placeholder hasn't been replaced
  return '';
}

/**
 * Construct a full path with the base path prefix.
 * Use this for window.location.href assignments and fetch calls to API routes.
 * 
 * @example
 * window.location.href = withBasePath('/settings');
 * fetch(withBasePath('/api/endpoint'), { ... });
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function sanitizeUnknownStrings<T>(data: T): T {
  if (typeof data === 'string') {
    return (data === '<UNKNOWN>' ? '' : data) as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeUnknownStrings(item)) as T;
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeUnknownStrings(value)])
    ) as T;
  }
  return data;
}
