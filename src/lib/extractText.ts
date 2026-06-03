import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

// We only need enough text to keyword-match and to give Claude context; cap it
// so a huge résumé can't blow up the prompt or the response payload.
const MAX_CHARS = 3000;

/**
 * Extract plain text from an uploaded résumé. Supports PDF (via pdf-parse) and
 * DOCX (via mammoth); throws on anything else. Server-only — relies on Node's
 * Buffer and the pdfjs runtime, so the calling route must use `runtime = "nodejs"`.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    // pdf-parse v2 is class-based; copy into a fresh Uint8Array because the
    // worker may take ownership of (transfer) the passed TypedArray.
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const { pages, text } = await parser.getText();
      // Join per-page text directly; the aggregated `text` interleaves
      // "-- N of M --" page-footer markers we don't want in the résumé.
      const joined = pages.length
        ? pages.map((p) => p.text).join("\n\n")
        : text;
      return joined.slice(0, MAX_CHARS);
    } finally {
      await parser.destroy();
    }
  }

  if (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.slice(0, MAX_CHARS);
  }

  throw new Error("Unsupported file type. Only PDF and DOCX allowed.");
}
