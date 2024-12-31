import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // ...
    },
  },
  productionBrowserSourceMaps: false,
}
 
export default nextConfig