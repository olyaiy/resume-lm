import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base path for the application.
 * Used for constructing URLs that bypass Next.js router (e.g., window.location.href, fetch).
 * Reads from Next.js runtime data which is set after entrypoint.sh placeholder substitution.
 */
export function getBasePath(): string {
  // Client-side: read from Next.js runtime data
  if (typeof window !== 'undefined') {
    const nextData = window.__NEXT_DATA__ as { basePath?: string } | undefined;
    if (nextData?.basePath) {
      return nextData.basePath;
    }
  }
  // Server-side: read from env (will be placeholder until runtime substitution)
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
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