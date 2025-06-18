/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from 'next'
import remarkGfm from 'remark-gfm'

// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-expect-error – @next/mdx lacks type declarations
import mdx from '@next/mdx'

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
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