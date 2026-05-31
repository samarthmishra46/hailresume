"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SchemaEditor } from "@/components/admin/SchemaEditor";
import { TemplatePreview } from "@/components/TemplatePreview";
import { buildSampleData } from "@/lib/handlebars";
import {
  deleteTemplate,
  saveTemplate,
  setTemplateStatus,
} from "@/app/actions/templates";
import type { Template, TemplateSchema } from "@/lib/types";

type Tab = "fields" | "html";

export function TemplateEditor({ template }: { template: Template }) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [html, setHtml] = useState(template.html_template);
  const [schema, setSchema] = useState<TemplateSchema>(template.schema);
  const [status, setStatus] = useState(template.status);
  const [tab, setTab] = useState<Tab>("fields");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Preview uses generated placeholder data so the admin sees a realistic resume.
  const sampleData = useMemo(() => buildSampleData(schema), [schema]);

  function save() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveTemplate({
        id: template.id,
        name,
        html_template: html,
        schema,
      });
      setMessage("error" in res ? res.error! : "Saved.");
    });
  }

  function togglePublish() {
    const next = status === "published" ? "draft" : "published";
    startTransition(async () => {
      const res = await setTemplateStatus(template.id, next);
      if ("error" in res) setMessage(res.error!);
      else setStatus(next);
    });
  }

  function remove() {
    if (!confirm("Delete this template permanently?")) return;
    startTransition(async () => {
      const res = await deleteTemplate(template.id);
      if ("error" in res) setMessage(res.error!);
      else router.push("/admin/templates");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: editor */}
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold"
          />
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="mb-3 flex gap-2">
          <TabButton active={tab === "fields"} onClick={() => setTab("fields")}>
            Form fields
          </TabButton>
          <TabButton active={tab === "html"} onClick={() => setTab("html")}>
            HTML
          </TabButton>
        </div>

        {tab === "fields" ? (
          <SchemaEditor schema={schema} onChange={setSchema} />
        ) : (
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            className="h-[28rem] w-full rounded-lg border border-slate-300 p-3 font-mono text-xs"
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            Save
          </button>
          <button
            onClick={togglePublish}
            disabled={pending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={remove}
            disabled={pending}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
          {message && <span className="text-sm text-slate-500">{message}</span>}
        </div>
      </div>

      {/* Right: live preview */}
      <div className="lg:sticky lg:top-4 lg:h-[42rem]">
        <p className="mb-2 text-sm font-medium text-slate-600">
          Preview (sample data)
        </p>
        <TemplatePreview
          htmlTemplate={html}
          data={sampleData}
          className="h-[40rem] w-full rounded-lg border border-slate-200 bg-white"
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
