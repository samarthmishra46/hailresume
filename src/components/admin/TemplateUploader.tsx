"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Uploads a résumé PDF to the generate route, then opens the new draft for review.
export function TemplateUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/templates/generate", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed.");
      router.push(`/admin/templates/${json.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onChange}
        disabled={busy}
      />
      <p className="text-sm text-slate-600">
        Upload a résumé PDF. Claude will turn it into an editable template and
        auto-detect its form fields.
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        {busy ? "Processing PDF with Claude…" : "Upload résumé PDF"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
