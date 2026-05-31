"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { templateSchemaSchema } from "@/lib/schema";
import type { TemplateSchema } from "@/lib/types";

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
