import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable source maps for better debugging in development
  productionBrowserSourceMaps: false, // Set to true if you need production debugging
  // Next.js automatically generates source maps in development mode
  // This ensures proper source map generation for client-side bundles
};

export default nextConfig;
