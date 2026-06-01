"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { templateSchemaSchema } from "@/lib/schema";
import type { TemplateSchema } from "@/lib/types";

// A minimal starting point for a manually-built template.
const BLANK_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; margin: 0; }
  .page { width: 210mm; min-height: 297mm; box-sizing: border-box; padding: 24mm; }
  h1 { margin: 0 0 4px; font-size: 26px; }
  .muted { color: #555; }
  h2 { font-size: 15px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: .04em; }
  .extra-field { margin: 2px 0; }
  .extra-label { font-weight: 600; }
</style></head><body>
  <div class="page">
    <h1>{{personal.fullName}}</h1>
    <p class="muted">{{personal.email}} · {{personal.phone}}</p>
    {{#each personal._extraFields}}<div class="extra-field"><span class="extra-label">{{this.label}}:</span> {{this.value}}</div>{{/each}}

    {{#each customSections}}
      <section><h2>{{this.label}}</h2>
        {{#each this.fields}}<div class="extra-field"><span class="extra-label">{{this.label}}:</span> {{this.value}}</div>{{/each}}
      </section>
    {{/each}}
  </div>
</body></html>`;

const BLANK_SCHEMA: TemplateSchema = {
  sections: [
    {
      id: "personal",
      label: "Personal Details",
      toggleable: false,
      repeatable: false,
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true },
        { id: "email", label: "Email", type: "email" },
        { id: "phone", label: "Phone", type: "phone" },
      ],
    },
  ],
};

// Create an empty draft template and open it in the editor.
export async function createBlankTemplate() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .insert({
      name: "Untitled template",
      status: "draft",
      created_by: profile.id,
      html_template: BLANK_HTML,
      schema: BLANK_SCHEMA,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create template.");
  redirect(`/admin/templates/${data.id}`);
}

// Save name / HTML / schema edits to a draft (or published) template.
export async function saveTemplate(input: {
  id: string;
  name: string;
  html_template: string;
  schema: TemplateSchema;
}) {
  await requireAdmin();

  const schema = templateSchemaSchema.parse(input.schema);
  const supabase = await createClient();
  const { error } = await supabase
    .from("templates")
    .update({
      name: input.name,
      html_template: input.html_template,
      schema,
    })
    .eq("id", input.id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/templates/${input.id}`);
  return { ok: true as const };
}

export async function setTemplateStatus(
  id: string,
  status: "draft" | "published",
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("templates")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/templates/${id}`);
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  return { ok: true as const };
}

export async function deleteTemplate(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/templates");
  return { ok: true as const };
}
