"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { Loader } from "@/components/Loader";
import { TONES, TONE_LABELS, type Tone } from "@/lib/coverLetterTypes";

async function downloadDocx(text: string, name: string) {
  const paragraphs = text
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map(
      (para) =>
        new Paragraph({
          children: [new TextRun({ text: para, size: 24, font: "Calibri" })],
          spacing: { after: 200 },
        }),
    );

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const slug = name.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  saveAs(blob, `${slug || "cover"}_cover_letter.docx`);
}

export function CoverLetterResult({
  coverLetter,
  name,
  currentTone,
  onRegenerate,
  loading,
}: {
  coverLetter: string;
  name: string;
  currentTone: Tone;
  onRegenerate: (tone: Tone) => void;
  loading: boolean;
}) {
  // State is initialized from props; the parent remounts this component (via a
  // changing `key`) on each fresh generation, so a new letter resets the editor.
  const [text, setText] = useState(coverLetter);
  const [regenTone, setRegenTone] = useState<Tone>(currentTone);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea to fit its content.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Your cover letter
        </h2>
        <span className="text-xs text-slate-400">
          {text.length} characters
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        className="w-full resize-none overflow-hidden rounded-lg border border-slate-300 px-4 py-3 text-sm leading-relaxed text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
        rows={10}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          type="button"
          onClick={() => downloadDocx(text, name)}
          disabled={loading || !text.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Download .docx
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="regen-tone" className="text-xs text-slate-500">
            Tone
          </label>
          <select
            id="regen-tone"
            value={regenTone}
            onChange={(e) => setRegenTone(e.target.value as Tone)}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {TONE_LABELS[t]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRegenerate(regenTone)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-70"
          >
            {loading && (
              <Loader className="h-4 w-4 border-white/40 border-t-white" />
            )}
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}
