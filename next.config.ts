import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {serverActions: {bodySizeLimit: "3mb"}},
  // Isolate fixture builds from the developer/production cache. No auth bypass.
  distDir: process.env.PLAYLOGG_E2E_BUILD === "1" ? ".next-e2e" : ".next",
};
export default nextConfig;
