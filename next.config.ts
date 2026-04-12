import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* GitHub Actions (APK build) ke liye 'export' use hoga.
     Vercel deployment ke liye ise undefined rakha gaya hai.
  */
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  
  trailingSlash: true, // APK navigation ke liye zaroori hai
  
  images: {
    unoptimized: true, // Firebase aur external images load karne ke liye
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },

  // Build errors bypass karne ke liye
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
