import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { DynamicForm } from "@/components/builder/DynamicForm";
import type { Resume, Template } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;
  await requireUser();
  const supabase = await createClient();

  // RLS ensures the user can only read their own resume.
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .single();
  if (!resume) notFound();

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", (resume as Resume).template_id)
    .single();
  if (!template) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/templates"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← All resumes
      </Link>
      <div className="mt-4">
        <DynamicForm resume={resume as Resume} template={template as Template} />
      </div>
    </main>
  );
}
