import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Actions build ke liye 'export' mode
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  
  trailingSlash: true, 
  
  images: {
    unoptimized: true, 
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
