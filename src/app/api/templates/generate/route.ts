import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { generateTemplateFromPdf } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 120; // Claude PDF processing can take a while.

// Admin uploads a résumé PDF -> Claude -> a draft template row.
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No PDF uploaded." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "File must be a PDF." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  // 1. Store the source PDF (service client; bucket is private).
  const service = createServiceClient();
  const pdfPath = `templates/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await service.storage
    .from("resume-pdfs")
    .upload(pdfPath, bytes, { contentType: "application/pdf" });
  if (uploadError) {
    return NextResponse.json(
      { error: `Could not store PDF: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // 2. Ask Claude to build the template + schema.
  let generated;
  try {
    generated = await generateTemplateFromPdf(base64);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // 3. Persist as a draft template.
  const { data, error: insertError } = await service
    .from("templates")
    .insert({
      name: generated.name,
      status: "draft",
      created_by: auth.userId,
      source_pdf_path: pdfPath,
      html_template: generated.html,
      schema: generated.schema,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `Could not save template: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id });
}
