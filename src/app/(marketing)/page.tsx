import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "HailResume — Build a resume that gets you hired",
  description:
    "Create an ATS-friendly resume in minutes with HailResume. Resume reviews, ATS scoring, cover letters and LinkedIn tools coming soon.",
};

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Free resume builder
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Build a resume that{" "}
              <span className="text-emerald-600">gets you hired</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Pick a recruiter-ready template, fill a smart form, preview live,
              and download a polished, ATS-friendly PDF — all in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/templates"
                className="rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Build my resume
              </Link>
              <Link
                href="#services"
                className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Explore all tools
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card · Sign in with Google
            </p>
          </div>

          {/* CSS resume mockup (no image assets) */}
          <div className="relative hidden lg:block">
            <ResumeMockup />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4">
          {[
            ["ATS-friendly", "templates"],
            ["Live", "preview"],
            ["1-click", "PDF export"],
            ["100% free", "to start"],
          ].map(([big, small]) => (
            <div key={small}>
              <p className="text-2xl font-bold text-emerald-600">{big}</p>
              <p className="text-sm text-slate-500">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Everything for your job search
          </h2>
          <p className="mt-3 text-slate-600">
            Start with the resume builder today. More tools are on the way.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={s.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{s.emoji}</span>
                {s.status === "live" ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {s.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">{s.tagline}</p>
              <span className="mt-4 text-sm font-medium text-emerald-700 group-hover:underline">
                {s.status === "live" ? "Start now →" : "Learn more →"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-emerald-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              ["1", "Pick a template", "Choose a design that fits your field and style."],
              ["2", "Fill your details", "Complete a guided form — toggle sections, add custom fields, upload a logo."],
              ["3", "Download your PDF", "Preview live and export a crisp, ATS-friendly resume."],
            ].map(([num, title, body]) => (
              <div key={num} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                  {num}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Why HailResume
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["🎯", "ATS-friendly", "Clean, parseable layouts that pass applicant tracking systems."],
            ["👀", "Live preview", "See exactly what your PDF will look like as you type."],
            ["🧩", "Fully flexible", "Toggle sections on/off and add your own custom fields."],
            ["⚡", "Fast & free", "From template to download in minutes, no cost to start."],
          ].map(([emoji, title, body]) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6">
              <span className="text-2xl">{emoji}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-emerald-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to land your next role?
          </h2>
          <p className="max-w-xl text-emerald-50">
            Build a standout resume today — and be first in line as our review,
            ATS, and cover-letter tools roll out.
          </p>
          <Link
            href="/templates"
            className="mt-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Build my resume
          </Link>
        </div>
      </section>
    </>
  );
}

// A lightweight CSS rendition of a resume, used as the hero visual.
function ResumeMockup() {
  return (
    <div className="rotate-2 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-emerald-100" />
        <div className="flex-1">
          <div className="h-3 w-32 rounded bg-slate-800" />
          <div className="mt-1.5 h-2 w-24 rounded bg-slate-300" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-2.5 w-20 rounded bg-emerald-500" />
        <div className="h-2 w-full rounded bg-slate-200" />
        <div className="h-2 w-11/12 rounded bg-slate-200" />
        <div className="h-2 w-10/12 rounded bg-slate-200" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-2.5 w-24 rounded bg-emerald-500" />
        <div className="h-2 w-full rounded bg-slate-200" />
        <div className="h-2 w-9/12 rounded bg-slate-200" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="h-2.5 w-16 rounded bg-emerald-500" />
          <div className="h-2 w-full rounded bg-slate-200" />
          <div className="h-2 w-10/12 rounded bg-slate-200" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-16 rounded bg-emerald-500" />
          <div className="h-2 w-full rounded bg-slate-200" />
          <div className="h-2 w-8/12 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
