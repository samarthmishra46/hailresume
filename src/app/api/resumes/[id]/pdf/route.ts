import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { renderResumeHtml } from "@/lib/handlebars";
import { htmlToPdf } from "@/lib/pdf";
import type { Resume, Template } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Renders the saved resume to a PDF. RLS ensures only the owner can read it.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const { data: template } = await supabase
    .from("templates")
    .select("html_template")
    .eq("id", (resume as Resume).template_id)
    .single();
  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  const html = renderResumeHtml(
    (template as Pick<Template, "html_template">).html_template,
    (resume as Resume).data,
  );

  try {
    const pdf = await htmlToPdf(html);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${(resume as Resume).title || "resume"}.pdf"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
