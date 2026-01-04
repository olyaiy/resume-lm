/**
 * Custom image loader for Next.js that handles runtime basePath
 *
 * This loader prepends the basePath to local image URLs, ensuring images
 * work correctly when the app is served at a path prefix (e.g., /resumelm).
 *
 * For Docker deployments with runtime basePath injection, the placeholder
 * /__NEXT_BASEPATH_PLACEHOLDER__ is replaced at container startup.
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

// Get basePath from environment or use placeholder for Docker builds
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/__NEXT_BASEPATH_PLACEHOLDER__';

export default function imageLoader({ src }: ImageLoaderProps): string {
  // External URLs (http://, https://) - return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Data URLs - return as-is
  if (src.startsWith('data:')) {
    return src;
  }

  // Local images - prepend basePath
  // Ensure src starts with /
  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;

  // For local images, we return direct URLs (no optimization)
  // This bypasses the _next/image endpoint which has issues with runtime basePath
  return `${basePath}${normalizedSrc}`;
}
