import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Actions par APK ke liye 'export', Vercel par normal mode
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  
  trailingSlash: true, 
  
  images: {
    unoptimized: true, // App mein images dikhane ke liye mandatory hai
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
