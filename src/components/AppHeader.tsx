import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { SERVICES } from "@/lib/services";
import type { Profile } from "@/lib/types";

// Short nav labels so the authed top bar stays tidy (the catalog names are long).
const SHORT_LABEL: Record<string, string> = {
  "resume-builder": "Templates",
  "resume-review": "Resume Review",
  "ats-score": "ATS Score",
  "cover-letter": "Cover Letter",
  "linkedin-review": "LinkedIn",
};

const NAV = SERVICES.map((s) => ({
  href: s.href,
  label: SHORT_LABEL[s.slug] ?? s.name,
}));

// Top navigation for the signed-in app. Links every tool; shows Admin to admins.
export function AppHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/templates" className="text-lg font-bold tracking-tight text-emerald-700">
          Hail<span className="text-slate-900">Resume</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-600 transition hover:text-emerald-700"
            >
              {l.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <>
              <Link
                href="/admin/templates"
                className="text-slate-600 transition hover:text-emerald-700"
              >
                Admin
              </Link>
              <Link
                href="/admin/messages"
                className="text-slate-600 transition hover:text-emerald-700"
              >
                Messages
              </Link>
            </>
          )}
          {profile && (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
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
