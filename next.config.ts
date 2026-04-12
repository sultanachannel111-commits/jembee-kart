import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Check karein ki kya ye GitHub Actions (APK build) hai.
     Agar hai toh 'export' use karein, warna Vercel ke liye undefined rehne dein.
  */
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined, 
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
