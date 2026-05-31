"use client";

import { useMemo } from "react";
import { renderResumeHtml } from "@/lib/handlebars";
import type { ResumeData } from "@/lib/types";

// Renders the compiled résumé HTML inside a sandboxed iframe. The sandbox has no
// allow-scripts token, so any script in the (Claude-generated or user-entered)
// markup is inert — only layout/styling renders.
export function TemplatePreview({
  htmlTemplate,
  data,
  className,
}: {
  htmlTemplate: string;
  data: ResumeData;
  className?: string;
}) {
  const html = useMemo(() => {
    try {
      return renderResumeHtml(htmlTemplate, data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Render error";
      return `<pre style="color:#b91c1c;font-family:sans-serif;padding:16px">Template error: ${message}</pre>`;
    }
  }, [htmlTemplate, data]);

  return (
    <iframe
      title="Resume preview"
      sandbox=""
      srcDoc={html}
      className={className ?? "h-full w-full rounded-lg border border-slate-200 bg-white"}
    />
  );
}
