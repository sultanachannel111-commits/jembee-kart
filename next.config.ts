import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Actions par APK ke liye 'export' use karega, Vercel par normal server mode
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  
  trailingSlash: true, // Dynamic routes ke liye zaroori hai
  
  images: {
    unoptimized: true, // Banners aur products ki images ke liye zaroori hai
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }, // Firebase images ke liye
    ],
  },

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
