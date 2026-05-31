"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ResumeData } from "@/lib/types";

// Start a new resume from a published template, then open the builder.
export async function createResume(templateId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: tpl } = await supabase
    .from("templates")
    .select("name")
    .eq("id", templateId)
    .single();

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      template_id: templateId,
      title: tpl?.name ? `${tpl.name} resume` : "My Resume",
      data: {},
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create resume.");
  redirect(`/builder/${data.id}`);
}

// Autosave the builder state. RLS guarantees the user owns the row.
export async function saveResume(input: {
  id: string;
  title: string;
  data: ResumeData;
}) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("resumes")
    .update({ title: input.title, data: input.data })
    .eq("id", input.id);

  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function deleteResume(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/templates");
  return { ok: true as const };
}
