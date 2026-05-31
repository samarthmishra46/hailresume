import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TemplateUploader } from "@/components/admin/TemplateUploader";
import type { Template } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("id, name, status, updated_at, schema")
    .order("updated_at", { ascending: false });
  const templates = (data ?? []) as Pick<
    Template,
    "id" | "name" | "status" | "updated_at" | "schema"
  >[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Templates</h1>
      </div>

      <TemplateUploader />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/admin/templates/${t.id}`}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-slate-900">{t.name}</h2>
              <StatusBadge status={t.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {t.schema.sections.length} section
              {t.schema.sections.length === 1 ? "" : "s"} · updated{" "}
              {new Date(t.updated_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>

      {templates.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          No templates yet. Upload a résumé PDF to create your first one.
        </p>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
