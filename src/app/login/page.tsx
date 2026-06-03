"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SERVICES } from "@/lib/services";

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/templates";
  const hadError = params.get("error");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setLoading(false);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / value panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 text-white lg:flex">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Hail<span className="text-emerald-200">Resume</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Your whole job-search toolkit, in one place.
          </h2>
          <p className="mt-3 max-w-md text-emerald-50">
            Sign in to unlock every HailResume tool — your work stays saved to
            your account.
          </p>

          <ul className="mt-8 space-y-3">
            {SERVICES.map((s) => (
              <li key={s.slug} className="flex items-start gap-3">
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-emerald-100">{s.tagline}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-emerald-200">
          Free to start · No credit card required
        </p>
      </aside>

      {/* Sign-in panel */}
      <div className="flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block text-lg font-bold tracking-tight text-emerald-700 lg:hidden"
          >
            Hail<span className="text-slate-900">Resume</span>
          </Link>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to build resumes, score them against jobs, and generate
              cover letters.
            </p>

            {hadError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                Sign-in failed. Please try again.
              </p>
            )}

            <button
              onClick={signIn}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <GoogleIcon />
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>

            <p className="mt-6 text-center text-xs text-slate-400">
              By continuing you agree to our terms. We only use your Google
              account to sign you in.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Just looking around?{" "}
            <Link href="/about" className="font-medium text-emerald-700 hover:underline">
              About
            </Link>{" "}
            ·{" "}
            <Link href="/contact" className="font-medium text-emerald-700 hover:underline">
              Contact
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
