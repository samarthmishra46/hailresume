"use client";

import { useState } from "react";
import { Loader } from "@/components/Loader";
import { ResumeDropzone } from "@/components/ResumeDropzone";
import { ReviewResult } from "@/components/resume-review/ReviewResult";
import type { Review } from "@/lib/resumeReview";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

type Level = "fresher" | "mid" | "senior";

const LEVELS: { value: Level; label: string }[] = [
  { value: "fresher", label: "Fresher (0–1 yrs)" },
  { value: "mid", label: "Mid-level (2–5 yrs)" },
  { value: "senior", label: "Senior (5+ yrs)" },
];

function isAllowed(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

// Shown while Claude works — reviews take longer than the ATS score.
function ReviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-500">
        <Loader className="h-5 w-5" />
        <p className="text-sm font-medium">
          Reviewing your resume… this can take up to a minute.
        </p>
      </div>
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-20 w-20 shrink-0 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-3 w-40 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-11/12 rounded bg-slate-100" />
              <div className="h-3 w-9/12 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [level, setLevel] = useState<Level>("mid");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);

  const tooLarge = !!file && file.size > MAX_FILE_BYTES;

  function selectFile(next: File | null) {
    setError(null);
    if (next && !isAllowed(next)) {
      setFile(null);
      setError("Unsupported file type. Please upload a .pdf or .docx file.");
      return;
    }
    setFile(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    if (tooLarge) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    formData.append("experienceLevel", level);
    formData.append("targetRole", targetRole.trim());

    setLoading(true);
    setReview(null);
    try {
      const res = await fetch("/api/resume-review", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReview(data as Review);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6 print:hidden">
        {/* Resume upload (shared dropzone) */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Resume <span className="text-slate-400">(PDF or DOCX)</span>
          </label>
          <div className="mt-2">
            <ResumeDropzone file={file} onSelect={selectFile} disabled={loading} />
          </div>
          {tooLarge && (
            <p className="mt-2 text-sm text-red-600">
              This file is larger than the 5MB limit.
            </p>
          )}
        </div>

        {/* Job description */}
        <div>
          <label htmlFor="jd" className="block text-sm font-medium text-slate-700">
            Job description
          </label>
          <textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the full job posting here…"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Experience level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700">
              Experience level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-700"
            >
              Target role
            </label>
            <input
              id="role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Engineer at Google"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || tooLarge}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader className="h-4 w-4 border-white/40 border-t-white" />}
          {loading ? "Reviewing…" : "Review my resume"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {loading && <ReviewSkeleton />}
      {!loading && review && <ReviewResult review={review} />}
    </div>
  );
}
