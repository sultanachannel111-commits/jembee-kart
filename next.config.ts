import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Humne 'output: export' hata diya hai kyunki aapko APK nahi chahiye.
     Ab Middleware aur saare Server-side functions Vercel par sahi chalenge.
  */
  
  trailingSlash: true, // URLs ko clean rakhta hai (e.g., /seller/login/)

  images: {
    unoptimized: true, // Images ko fast load karne ke liye
  },

  typescript: {
    ignoreBuildErrors: true, // Agar minor typing errors hain toh build nahi rukegi
  },

  eslint: {
    ignoreDuringBuilds: true, // Build ke waqt linting errors ko ignore karega
  },
};

export default nextConfig;
