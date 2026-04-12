import type { NextConfig } from "next";

// Sirf tab export karein jab aapko sach mein static files chahiye
// Lekin yaad rahe, isse Middleware band ho jayega
const nextConfig: NextConfig = {
  // output: "export", // Ise comment kar dein agar Vercel use kar rahi hain
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
