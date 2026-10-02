import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
      { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.igdb.com https://*.steamstatic.com https://*.steamcdn-a.akamaihd.net; connect-src 'self'; form-action 'self' https://steamcommunity.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
    ] }];
  },
  experimental: {serverActions: {bodySizeLimit: "3mb"}},
  // Isolate fixture builds from the developer/production cache. No auth bypass.
  distDir: process.env.PLAYLOGG_E2E_BUILD === "1" ? ".next-e2e" : ".next",
};
export default nextConfig;
