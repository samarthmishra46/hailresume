import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — HailResume",
  description:
    "HailResume helps job seekers build standout, ATS-friendly resumes — with reviews, ATS scoring, cover letters and LinkedIn tools on the way.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        About HailResume
      </h1>
      <p className="mt-6 text-lg text-slate-600">
        HailResume is on a mission to make a great resume accessible to everyone.
        Job searching is stressful enough — your resume shouldn&apos;t be the hard
        part.
      </p>

      <div className="mt-10 space-y-8 text-slate-600">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">What we do today</h2>
          <p className="mt-3">
            Our resume builder lets you pick a recruiter-ready template, fill a
            guided form, toggle sections to match your experience, add custom
            fields, preview live, and download a clean, ATS-friendly PDF — for
            free.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">Where we&apos;re headed</h2>
          <p className="mt-3">
            We&apos;re building a full career toolkit: instant resume reviews, ATS
            scoring against real job descriptions, AI cover letters, and LinkedIn
            optimization. Each launches as we make sure it genuinely helps you get
            more interviews.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">Why it matters</h2>
          <p className="mt-3">
            Most resumes are filtered by software before a human ever sees them.
            We focus on clean, parseable output and recruiter-tested guidance so
            your application actually gets read.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/templates"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Build my resume
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
