import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ContactMessage {
  id: string;
  created_at: string;
  type: "contact" | "notify";
  name: string | null;
  email: string;
  message: string | null;
  service: string | null;
}

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  // RLS limits this select to admins.
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  const messages = (data ?? []) as ContactMessage[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
        <Link
          href="/admin/templates"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Templates
        </Link>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-slate-500">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.type === "notify"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {m.type === "notify" ? `notify · ${m.service ?? ""}` : "contact"}
                </span>
                {m.name && (
                  <span className="text-sm font-medium text-slate-900">
                    {m.name}
                  </span>
                )}
                <a
                  href={`mailto:${m.email}`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  {m.email}
                </a>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              {m.message && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {m.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
