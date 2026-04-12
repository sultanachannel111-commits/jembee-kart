import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Actions (APK) ke liye export mode, Vercel ke liye standard mode
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
