import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Verify and decode the session JWT. With Supabase JWT signing keys enabled this
// happens LOCALLY (no network round-trip) — far faster than getUser(), which
// calls the Auth server every time. cache() dedupes it within a single render.
export const getClaims = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

// Current user's id + email from the verified claims, or null.
export const getSessionUser = cache(async () => {
  const claims = await getClaims();
  if (!claims) return null;
  return {
    id: claims.sub as string,
    email: (claims.email as string | undefined) ?? null,
  };
});

// Current user's profile (incl. role). One DB query, deduped per render.
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
});

// Guard for client-area pages: redirects to /login when signed out.
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

// Guard for admin-area pages: redirects non-admins.
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/templates");
  return profile;
}

type AdminApiResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

// Guard for API routes: returns a typed result instead of redirecting.
export async function requireAdminApi(): Promise<AdminApiResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, status: 401, error: "Not signed in." };
  if (profile.role !== "admin")
    return { ok: false, status: 403, error: "Admins only." };
  return { ok: true, userId: profile.id };
}
