"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FieldInput } from "@/components/builder/FieldInput";
import { TemplatePreview } from "@/components/TemplatePreview";
import { saveResume } from "@/app/actions/resumes";
import type {
  CustomSection,
  ExtraField,
  Resume,
  Template,
  TemplateSection,
} from "@/lib/types";

type Entry = Record<string, unknown> & { _extraFields?: ExtraField[] };

export function DynamicForm({
  resume,
  template,
}: {
  resume: Resume;
  template: Template;
}) {
  const [title, setTitle] = useState(resume.title);
  const [data, setData] = useState(resume.data ?? {});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [downloading, setDownloading] = useState(false);
  const firstRender = useRef(true);

  // Debounced autosave whenever the form changes.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(async () => {
      await saveResume({ id: resume.id, title, data });
      setSaveState("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [title, data, resume.id]);

  const enabled = useCallback(
    (id: string) => (data.sections?.[id] ?? true) !== false,
    [data.sections],
  );

  function setEnabled(id: string, on: boolean) {
    setData((d) => ({ ...d, sections: { ...d.sections, [id]: on } }));
  }

  // ---- non-repeatable section helpers ----
  function getEntry(id: string): Entry {
    return (data[id] as Entry) ?? {};
  }
  function setEntryField(id: string, fieldId: string, value: unknown) {
    setData((d) => ({
      ...d,
      [id]: { ...((d[id] as Entry) ?? {}), [fieldId]: value },
    }));
  }

  // ---- repeatable section helpers ----
  function getEntries(id: string): Entry[] {
    return Array.isArray(data[id]) ? (data[id] as Entry[]) : [];
  }
  function setEntries(id: string, entries: Entry[]) {
    setData((d) => ({ ...d, [id]: entries }));
  }

  async function download() {
    setDownloading(true);
    try {
      await saveResume({ id: resume.id, title, data });
      const res = await fetch(`/api/resumes/${resume.id}/pdf`);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold"
          />
          <span className="text-xs text-slate-400">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : ""}
          </span>
        </div>

        {template.schema.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            enabled={enabled(section.id)}
            onToggle={(on) => setEnabled(section.id, on)}
          >
            {section.repeatable ? (
              <RepeatableSection
                section={section}
                entries={getEntries(section.id)}
                onChange={(entries) => setEntries(section.id, entries)}
              />
            ) : (
              <SingleSection
                section={section}
                entry={getEntry(section.id)}
                onField={(fieldId, value) =>
                  setEntryField(section.id, fieldId, value)
                }
                onExtraFields={(extra) =>
                  setData((d) => ({
                    ...d,
                    [section.id]: {
                      ...((d[section.id] as Entry) ?? {}),
                      _extraFields: extra,
                    },
                  }))
                }
              />
            )}
          </SectionCard>
        ))}

        <CustomSections
          sections={(data.customSections as CustomSection[]) ?? []}
          onChange={(cs) => setData((d) => ({ ...d, customSections: cs }))}
        />

        <button
          onClick={download}
          disabled={downloading}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-4 lg:h-[44rem]">
        <p className="mb-2 text-sm font-medium text-slate-600">Live preview</p>
        <TemplatePreview
          htmlTemplate={template.html_template}
          data={data}
          className="h-[42rem] w-full rounded-lg border border-slate-200 bg-white"
        />
      </div>
    </div>
  );
}

function SectionCard({
  section,
  enabled,
  onToggle,
  children,
}: {
  section: TemplateSection;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{section.label}</h3>
        {section.toggleable && (
          <label className="flex items-center gap-2 text-xs text-slate-500">
            {enabled ? "Included" : "Hidden"}
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-4 w-8 cursor-pointer"
            />
          </label>
        )}
      </div>
      {enabled && children}
    </div>
  );
}

function SingleSection({
  section,
  entry,
  onField,
  onExtraFields,
}: {
  section: TemplateSection;
  entry: Entry;
  onField: (fieldId: string, value: unknown) => void;
  onExtraFields: (extra: ExtraField[]) => void;
}) {
  return (
    <div className="space-y-4">
      {section.fields.map((field) => (
        <FieldInput
          key={field.id}
          field={field}
          value={entry[field.id]}
          onChange={(v) => onField(field.id, v)}
        />
      ))}
      <ExtraFieldsEditor
        extra={entry._extraFields ?? []}
        onChange={onExtraFields}
      />
    </div>
  );
}

function RepeatableSection({
  section,
  entries,
  onChange,
}: {
  section: TemplateSection;
  entries: Entry[];
  onChange: (entries: Entry[]) => void;
}) {
  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {section.label} #{i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
              className="text-xs text-red-600 hover:underline"
            >
              remove
            </button>
          </div>
          <div className="space-y-3">
            {section.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={entry[field.id]}
                onChange={(v) => {
                  const next = [...entries];
                  next[i] = { ...next[i], [field.id]: v };
                  onChange(next);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...entries, {}])}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        + add {section.label.toLowerCase()}
      </button>
    </div>
  );
}

// Lets the client add their own labelled fields to a known section.
function ExtraFieldsEditor({
  extra,
  onChange,
}: {
  extra: ExtraField[];
  onChange: (extra: ExtraField[]) => void;
}) {
  return (
    <div className="border-t border-dashed border-slate-200 pt-3">
      {extra.map((f, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <input
            value={f.label}
            placeholder="Label"
            onChange={(e) => {
              const next = [...extra];
              next[i] = { ...next[i], label: e.target.value };
              onChange(next);
            }}
            className="w-1/3 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            value={f.value}
            placeholder="Value"
            onChange={(e) => {
              const next = [...extra];
              next[i] = { ...next[i], value: e.target.value };
              onChange(next);
            }}
            className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(extra.filter((_, idx) => idx !== i))}
            className="text-sm text-red-600 hover:underline"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...extra, { label: "", value: "" }])}
        className="text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        + add custom field
      </button>
    </div>
  );
}

// Lets the client add entirely new sections not in the template.
function CustomSections({
  sections,
  onChange,
}: {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
      <h3 className="mb-3 font-semibold text-slate-900">Custom sections</h3>
      <div className="space-y-4">
        {sections.map((cs, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex gap-2">
              <input
                value={cs.label}
                placeholder="Section title"
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = { ...next[i], label: e.target.value };
                  onChange(next);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => onChange(sections.filter((_, idx) => idx !== i))}
                className="text-xs text-red-600 hover:underline"
              >
                remove
              </button>
            </div>
            <ExtraFieldsEditor
              extra={cs.fields}
              onChange={(fields) => {
                const next = [...sections];
                next[i] = { ...next[i], fields };
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...sections, { label: "", fields: [] }])}
        className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        + add custom section
      </button>
    </div>
  );
}
