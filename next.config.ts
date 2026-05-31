import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium + puppeteer-core must stay external (not bundled) so the
  // serverless function can load the Chromium binary at runtime.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  images: {
    remotePatterns: [
      // Supabase Storage public URLs (logos, avatars).
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
