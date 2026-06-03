import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and enforces coarse
// route protection. Fine-grained admin checks live in the (admin) layout.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() verifies the JWT locally when signing keys are enabled (no
  // network call) and refreshes the session cookie. Do not run logic between
  // creating the client and this call.
  const { data } = await supabase.auth.getClaims();
  const isAuthed = !!data?.claims;

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/templates") ||
    pathname.startsWith("/builder") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ats-score") ||
    pathname.startsWith("/cover-letter") ||
    pathname.startsWith("/resume-review") ||
    pathname.startsWith("/linkedin-review");

  if (!isAuthed && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
