"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitNotify } from "@/app/actions/contact";
import { Loader } from "@/components/Loader";

// Coming-soon hero with a "notify me" email capture for a given service.
export function ComingSoon({
  service,
  name,
  emoji,
  description,
}: {
  service: string;
  name: string;
  emoji: string;
  description: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitNotify(service, email);
      if ("error" in res) setError(res.error!);
      else setDone(true);
    });
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="mb-6 text-6xl">{emoji}</span>
      <span className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        Coming soon
      </span>
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{name}</h1>
      <p className="mt-4 max-w-lg text-slate-600">{description}</p>

      {done ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-800">
          You&apos;re on the list — we&apos;ll email you the moment it launches.
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-70"
          >
            {pending && <Loader className="h-4 w-4 border-white/40 border-t-white" />}
            {pending ? "Saving…" : "Notify me"}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <Link
        href="/templates"
        className="mt-10 text-sm font-medium text-emerald-700 hover:underline"
      >
        Meanwhile, build your resume now →
      </Link>
    </section>
  );
}
