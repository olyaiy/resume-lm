/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from 'next'
import remarkGfm from 'remark-gfm'

// eslint-disable-next-line import/no-extraneous-dependencies
import mdx from '@next/mdx'

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: 'standalone',
  // Support serving the app at a path prefix (e.g., /resumelm)
  // Docker builds use a placeholder that gets replaced at runtime by entrypoint.sh
  // Local dev uses NEXT_PUBLIC_BASE_PATH env var directly
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '/__NEXT_BASEPATH_PLACEHOLDER__',
  // Custom image loader to handle runtime basePath injection
  // The default Next.js image optimizer doesn't work with runtime basePath because
  // it makes internal HTTP requests without the basePath prefix
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
  experimental: {
    turbo: {
      // ...
    },
  },
  // Allow MDX files to be considered pages/components
  pageExtensions: ['ts', 'tsx', 'mdx'],
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
}

export default withMDX(nextConfig)