"use client";

import { useState } from "react";
import { Loader } from "@/components/Loader";
import { ResumeDropzone } from "@/components/ResumeDropzone";
import { CoverLetterResult } from "@/components/cover-letter/CoverLetterResult";
import { TONES, TONE_LABELS, type Tone } from "@/lib/coverLetterTypes";

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

export function CoverLetterForm() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [level, setLevel] = useState<Level>("mid");
  const [tone, setTone] = useState<Tone>("formal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  // Bumped on each successful generation so the result panel remounts and
  // re-initializes its editable text from the new letter.
  const [genId, setGenId] = useState(0);

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

  // Shared by the form submit and the result's "Regenerate" button.
  async function generate(useTone: Tone) {
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
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
    formData.append("name", name.trim());
    formData.append("tone", useTone);

    setLoading(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setCoverLetter(data.coverLetter as string);
      setGenId((g) => g + 1);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    generate(tone);
  }

  function onRegenerate(nextTone: Tone) {
    setTone(nextTone);
    generate(nextTone);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-80"
          />
        </div>

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

        {/* Experience level */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-700">
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

        {/* Tone */}
        <div>
          <span className="block text-sm font-medium text-slate-700">Tone</span>
          <div className="mt-2 inline-flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                aria-pressed={tone === t}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  tone === t
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || tooLarge}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader className="h-4 w-4 border-white/40 border-t-white" />}
          {loading ? "Generating…" : coverLetter ? "Generate again" : "Generate cover letter"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {coverLetter !== null && (
        <CoverLetterResult
          key={genId}
          coverLetter={coverLetter}
          name={name}
          currentTone={tone}
          onRegenerate={onRegenerate}
          loading={loading}
        />
      )}
    </div>
  );
}
