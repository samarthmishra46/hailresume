"use client";

import type {
  FieldType,
  TemplateField,
  TemplateSchema,
  TemplateSection,
} from "@/lib/types";

const FIELD_TYPES: FieldType[] = [
  "text",
  "textarea",
  "month",
  "date",
  "url",
  "email",
  "phone",
  "list",
  "image",
];

// Editable view of a template's form schema: rename labels, change field types,
// flip toggleable/repeatable, add/remove fields and sections.
export function SchemaEditor({
  schema,
  onChange,
}: {
  schema: TemplateSchema;
  onChange: (next: TemplateSchema) => void;
}) {
  function updateSection(i: number, patch: Partial<TemplateSection>) {
    const sections = schema.sections.map((s, idx) =>
      idx === i ? { ...s, ...patch } : s,
    );
    onChange({ sections });
  }

  function updateField(si: number, fi: number, patch: Partial<TemplateField>) {
    const section = schema.sections[si];
    const fields = section.fields.map((f, idx) =>
      idx === fi ? { ...f, ...patch } : f,
    );
    updateSection(si, { fields });
  }

  function addField(si: number) {
    const fields = [
      ...schema.sections[si].fields,
      { id: `field${Date.now()}`, label: "New field", type: "text" as FieldType },
    ];
    updateSection(si, { fields });
  }

  function removeField(si: number, fi: number) {
    const fields = schema.sections[si].fields.filter((_, idx) => idx !== fi);
    updateSection(si, { fields });
  }

  function removeSection(si: number) {
    onChange({ sections: schema.sections.filter((_, idx) => idx !== si) });
  }

  function addSection() {
    onChange({
      sections: [
        ...schema.sections,
        {
          id: `section${Date.now()}`,
          label: "New section",
          toggleable: true,
          repeatable: false,
          fields: [],
        },
      ],
    });
  }

  return (
    <div className="space-y-4">
      {schema.sections.map((section, si) => (
        <div
          key={si}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={section.label}
              onChange={(e) => updateSection(si, { label: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium"
              placeholder="Section label"
            />
            <code className="text-xs text-slate-400">{section.id}</code>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={section.toggleable}
                onChange={(e) =>
                  updateSection(si, { toggleable: e.target.checked })
                }
              />
              toggleable
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={section.repeatable}
                onChange={(e) =>
                  updateSection(si, { repeatable: e.target.checked })
                }
              />
              repeatable
            </label>
            <button
              onClick={() => removeSection(si)}
              className="text-xs text-red-600 hover:underline"
            >
              remove
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {section.fields.map((field, fi) => (
              <div key={fi} className="flex flex-wrap items-center gap-2">
                <input
                  value={field.label}
                  onChange={(e) =>
                    updateField(si, fi, { label: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  placeholder="Field label"
                />
                <code className="text-xs text-slate-400">{field.id}</code>
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(si, fi, { type: e.target.value as FieldType })
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(e) =>
                      updateField(si, fi, { required: e.target.checked })
                    }
                  />
                  req
                </label>
                <button
                  onClick={() => removeField(si, fi)}
                  className="text-xs text-red-600 hover:underline"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addField(si)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              + add field
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addSection}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        + add section
      </button>
    </div>
  );
}
