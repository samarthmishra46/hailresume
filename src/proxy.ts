import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 "proxy" convention (formerly "middleware").
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only run session refresh on real page navigations. Skip static assets, image
  // optimization, API routes (they authenticate themselves), and the auth
  // callback — this avoids an extra Supabase round-trip on every such request.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
