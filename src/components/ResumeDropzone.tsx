"use client";

import { useRef, useState } from "react";

// Reusable résumé upload box (click + drag & drop). Presentational: the parent
// owns the selected File and performs validation. Mirrors the upload UI in the
// ATS checker so both features share one look and feel.
export function ResumeDropzone({
  file,
  onSelect,
  accept = ".pdf,.docx",
  disabled = false,
}: {
  file: File | null;
  onSelect: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function open() {
    if (!disabled) inputRef.current?.click();
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onSelect(dropped);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
        dragging
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-300 bg-slate-50 hover:border-emerald-400"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
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
          <span className="font-medium text-emerald-700">Click to upload</span>{" "}
          or drag and drop{" "}
          <span className="text-slate-400">(PDF or DOCX)</span>
        </p>
      )}
    </div>
  );
}
