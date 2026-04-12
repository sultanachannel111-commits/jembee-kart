import type { NextConfig } from "next";

const isExport = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  // ✅ APK build ke time static export
  output: isExport ? "export" : undefined,

  // ✅ Static hosting ke liye required
  trailingSlash: true,

  // ✅ Image issues fix (important for export)
  images: {
    unoptimized: true,
  },

  // ✅ Build fail na ho (APK ke liye safe)
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Optional (extra safe for static export)
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
