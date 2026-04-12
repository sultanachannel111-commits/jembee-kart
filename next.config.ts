import type { NextConfig } from "next";

const isExport = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
