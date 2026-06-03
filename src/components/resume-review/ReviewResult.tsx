"use client";

import type { Review } from "@/lib/resumeReview";

type Accent = {
  border: string;
  bg: string;
  text: string;
};

const ACCENTS: Record<string, Accent> = {
  green: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-800" },
  red: { border: "border-red-200", bg: "bg-red-50", text: "text-red-800" },
  amber: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-900" },
  blue: { border: "border-sky-200", bg: "bg-sky-50", text: "text-sky-800" },
  gray: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-700" },
};

function scoreColors(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 ring-amber-200";
  return "bg-red-100 text-red-700 ring-red-200";
}

// Collapsible section (open by default) with a colored theme.
function Section({
  title,
  accent,
  count,
  children,
}: {
  title: string;
  accent: keyof typeof ACCENTS;
  count?: number;
  children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <details open className={`group rounded-2xl border ${a.border} ${a.bg} p-5`}>
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <h3 className={`text-sm font-semibold ${a.text}`}>
          {title}
          {typeof count === "number" && (
            <span className="ml-1 font-normal opacity-60">({count})</span>
          )}
        </h3>
        <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  );
}

function PointList({
  items,
  tone,
}: {
  items: { point: string; detail: string }[];
  tone: "green" | "red";
}) {
  const dot = tone === "green" ? "text-emerald-500" : "text-red-500";
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className={`mt-0.5 ${dot}`} aria-hidden>
            {tone === "green" ? "✓" : "✕"}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{it.point}</p>
            <p className="text-sm text-slate-600">{it.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Resource({ resource }: { resource: string }) {
  const isUrl = /^https?:\/\//i.test(resource.trim());
  if (isUrl) {
    return (
      <a
        href={resource.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-700 underline underline-offset-2 hover:text-sky-800"
      >
        {resource.trim()}
      </a>
    );
  }
  return <span className="text-sky-800">{resource}</span>;
}

export function ReviewResult({ review }: { review: Review }) {
  return (
    <div className="space-y-5">
      {/* Action bar (not printed) */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Download Review as PDF
        </button>
      </div>

      {/* 1. Overall score */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center sm:flex-row sm:text-left">
        <div
          className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full text-2xl font-bold ring-2 ${scoreColors(
            review.overallScore,
          )}`}
        >
          {review.overallScore}
          <span className="text-[10px] font-medium opacity-70">/ 100</span>
        </div>
        <p className="text-slate-600">{review.summary}</p>
      </div>

      {/* 2. Pros */}
      <Section title="What's working" accent="green" count={review.pros.length}>
        <PointList items={review.pros} tone="green" />
      </Section>

      {/* 3. Cons */}
      <Section title="What's hurting you" accent="red" count={review.cons.length}>
        <PointList items={review.cons} tone="red" />
      </Section>

      {/* 4. Changes to make */}
      <Section
        title="Specific changes to make"
        accent="amber"
        count={review.changes.length}
      >
        <ul className="space-y-4">
          {review.changes.map((c, i) => (
            <li key={i} className="rounded-xl border border-amber-200 bg-white p-4">
              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                {c.section}
              </span>
              {c.current && (
                <p className="mt-2 text-sm text-slate-400 line-through">
                  {c.current}
                </p>
              )}
              <p className="mt-1 flex gap-2 text-sm text-slate-800">
                <span className="text-amber-600" aria-hidden>
                  →
                </span>
                <span>{c.suggestion}</span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 5. Skills to learn */}
      <Section
        title="Skills to add to your profile"
        accent="blue"
        count={review.skillsToLearn.length}
      >
        <ul className="space-y-3">
          {review.skillsToLearn.map((s, i) => (
            <li key={i} className="rounded-xl border border-sky-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">{s.skill}</p>
              <p className="text-sm text-slate-600">{s.reason}</p>
              <p className="mt-1 text-sm">
                <span className="text-slate-400">Learn it: </span>
                <Resource resource={s.resource} />
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 6. Format issues */}
      {review.formatIssues.length > 0 && (
        <Section
          title="Formatting problems"
          accent="gray"
          count={review.formatIssues.length}
        >
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {review.formatIssues.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* 7. Missing keywords */}
      {review.keywordsMissing.length > 0 && (
        <Section
          title="Keywords missing from resume"
          accent="red"
          count={review.keywordsMissing.length}
        >
          <div className="flex flex-wrap gap-2">
            {review.keywordsMissing.map((kw, i) => (
              <span
                key={i}
                className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200"
              >
                {kw}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
