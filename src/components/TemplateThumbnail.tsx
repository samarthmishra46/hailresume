"use client";

import { useMemo } from "react";
import { buildSampleData, renderResumeHtml } from "@/lib/handlebars";
import type { TemplateSchema } from "@/lib/types";

// A non-interactive, scaled-down live preview of a template filled with sample
// data — used as the card "image" on the templates page.
export function TemplateThumbnail({
  htmlTemplate,
  schema,
}: {
  htmlTemplate: string;
  schema: TemplateSchema;
}) {
  const html = useMemo(() => {
    try {
      return renderResumeHtml(htmlTemplate, buildSampleData(schema));
    } catch {
      return "<div style='font-family:sans-serif;padding:24px;color:#94a3b8'>Preview unavailable</div>";
    }
  }, [htmlTemplate, schema]);

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-t-xl border-b border-slate-200 bg-white">
      <iframe
        title="Template preview"
        aria-hidden="true"
        sandbox=""
        srcDoc={html}
        // A4 width is ~794px; scale it down and pin to the top-left so the card
        // shows the top portion of the resume.
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: "794px", height: "1123px", transform: "scale(0.46)" }}
      />
    </div>
  );
}
