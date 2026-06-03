import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium + puppeteer-core must stay external (not bundled) so the
  // serverless function can load the Chromium binary at runtime.
  // pdf-parse (pdfjs worker/wasm) + mammoth read the filesystem at runtime and
  // must not be bundled by Turbopack — keep them external too.
  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
    "pdf-parse",
    "mammoth",
  ],
  images: {
    remotePatterns: [
      // Supabase Storage public URLs (logos, avatars).
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
