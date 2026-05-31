"use client";

import { ImageUploader } from "@/components/builder/ImageUploader";
import type { TemplateField } from "@/lib/types";

const HTML_INPUT_TYPE: Record<string, string> = {
  text: "text",
  email: "email",
  phone: "tel",
  url: "url",
  date: "date",
  month: "month",
};

// Renders one form control for a template field, given its current value.
export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </label>
  );

  if (field.type === "image") {
    return (
      <div>
        {label}
        <ImageUploader
          value={typeof value === "string" ? value : undefined}
          onChange={(url) => onChange(url)}
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (field.type === "list") {
    return (
      <div>
        {label}
        <ListInput
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        type={HTML_INPUT_TYPE[field.type] ?? "text"}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function ListInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="text-sm text-red-600 hover:underline"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        + add item
      </button>
    </div>
  );
}
