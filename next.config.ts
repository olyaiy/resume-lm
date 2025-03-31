import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // ...
    },
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
}
 
export default nextConfig