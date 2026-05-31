import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Returns the current auth user, or null. Use in Server Components/Actions.
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Returns the current user's profile (incl. role), or null.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

// Guard for client-area pages: redirects to /login when signed out.
export async function requireUser() {
  const user = await getUser();
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
