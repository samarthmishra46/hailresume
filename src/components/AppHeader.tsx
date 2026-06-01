import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";

// Top navigation. Shows an Admin link only to admins.
export function AppHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/templates" className="text-lg font-semibold text-slate-900">
          Resume Builder
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/templates" className="text-slate-600 hover:text-slate-900">
            Templates
          </Link>
          {profile?.role === "admin" && (
            <>
              <Link
                href="/admin/templates"
                className="text-slate-600 hover:text-slate-900"
              >
                Admin
              </Link>
              <Link
                href="/admin/messages"
                className="text-slate-600 hover:text-slate-900"
              >
                Messages
              </Link>
            </>
          )}
          {profile && (
            <div className="flex items-center gap-3">
              <span className="hidden text-slate-500 sm:inline">
                {profile.full_name ?? profile.email}
              </span>
              <form action={signOut}>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50">
                  Sign out
                </button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
