import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { createResume } from "@/app/actions/resumes";
import { TemplateThumbnail } from "@/components/TemplateThumbnail";
import { SubmitButton } from "@/components/SubmitButton";
import type { Template } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: templateRows }, { data: resumeRows }] = await Promise.all([
    supabase
      .from("templates")
      .select("id, name, schema, html_template")
      .eq("status", "published")
      .order("updated_at", { ascending: false }),
    supabase
      .from("resumes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const templates = (templateRows ?? []) as Pick<
    Template,
    "id" | "name" | "schema" | "html_template"
  >[];
  const resumes = (resumeRows ?? []) as {
    id: string;
    title: string;
    updated_at: string;
  }[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {resumes.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Your resumes
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <Link
                key={r.id}
                href={`/builder/${r.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
              >
                <p className="font-medium text-slate-900">{r.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  edited {new Date(r.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Choose a template
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Pick a design to start a new resume.
        </p>

        {templates.length === 0 ? (
          <p className="text-sm text-slate-500">
            No templates are available yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <TemplateThumbnail
                  htmlTemplate={t.html_template}
                  schema={t.schema}
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-medium text-slate-900">{t.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-slate-500">
                    {t.schema.sections.map((s) => s.label).join(" · ")}
                  </p>
                  <form
                    action={async () => {
                      "use server";
                      await createResume(t.id);
                    }}
                    className="mt-4"
                  >
                    <SubmitButton
                      pendingLabel="Creating…"
                      className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      Use this template
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
