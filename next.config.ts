import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Actions (APK) ke liye export mode zaroori hai
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  trailingSlash: true, 
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
