"use client";

import { useRef, useState } from "react";
import { Loader } from "@/components/Loader";
import { ScoreResult, type AtsScore } from "@/components/ats/ScoreResult";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPT = ".pdf,.docx";

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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AtsForm() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [level, setLevel] = useState<Level>("mid");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsScore | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

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

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
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

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as AtsScore);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* File upload (drag & drop) */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Resume <span className="text-slate-400">(PDF or DOCX)</span>
          </label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-300 bg-slate-50 hover:border-emerald-400"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
            />
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-slate-400"
            >
              <path d="M12 16V4m0 0L8 8m4-4 4 4" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            {file ? (
              <p className="mt-2 text-sm font-medium text-slate-700">
                {file.name}{" "}
                <span className="text-slate-400">({formatSize(file.size)})</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                <span className="font-medium text-emerald-700">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
            )}
          </div>
          {tooLarge && (
            <p className="mt-2 text-sm text-red-600">
              This file is {formatSize(file!.size)} — larger than the 5MB limit.
            </p>
          )}
        </div>

        {/* Job description */}
        <div>
          <label
            htmlFor="jd"
            className="block text-sm font-medium text-slate-700"
          >
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

        {/* Experience level */}
        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-slate-700"
          >
            Experience level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-64"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || tooLarge}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && (
            <Loader className="h-4 w-4 border-white/40 border-t-white" />
          )}
          {loading ? "Scoring…" : "Check ATS score"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && <ScoreResult result={result} />}
    </div>
  );
}
