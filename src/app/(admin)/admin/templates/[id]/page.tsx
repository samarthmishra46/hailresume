import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplateEditor } from "@/components/admin/TemplateEditor";
import type { Template } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const template = data as Template;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/admin/templates"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← All templates
      </Link>
      <div className="mt-4">
        <TemplateEditor template={template} />
      </div>
    </main>
  );
}
