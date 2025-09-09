import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Turbopack configuration (replaces webpack)
  turbopack: {
    // Turbopack handles module resolution and fallbacks automatically
    // No need for manual webpack configurations
  },
};

export default nextConfig;
