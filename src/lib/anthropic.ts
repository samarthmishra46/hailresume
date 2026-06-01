import Anthropic from "@anthropic-ai/sdk";
import { claudeGenerationSchema, type ClaudeGeneration } from "@/lib/schema";

// Server-only Claude client. The app owner's key processes uploaded resume PDFs.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// User explicitly chose Sonnet to process resumes.
const MODEL = "claude-sonnet-4-6";

// JSON-schema contract for structured outputs. Mirrors `claudeGenerationSchema`
// in schema.ts. Structured outputs require `additionalProperties: false` on every
// object; optional fields simply stay out of `required`.
const OUTPUT_FORMAT = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      html: { type: "string" },
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                toggleable: { type: "boolean" },
                repeatable: { type: "boolean" },
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "string" },
                      label: { type: "string" },
                      type: {
                        type: "string",
                        enum: [
                          "text",
                          "textarea",
                          "month",
                          "date",
                          "url",
                          "email",
                          "phone",
                          "list",
                          "image",
                        ],
                      },
                      required: { type: "boolean" },
                      placeholder: { type: "string" },
                    },
                    required: ["id", "label", "type"],
                  },
                },
              },
              required: ["id", "label", "toggleable", "repeatable", "fields"],
            },
          },
        },
        required: ["sections"],
      },
    },
    required: ["name", "html", "schema"],
  },
};

// Stable system prompt — cached so repeated generations reuse the prefix.
const SYSTEM_PROMPT = `You convert a sample résumé PDF into a reusable, fillable template for a résumé-builder app. You return ONE JSON object with three keys: "name", "html", and "schema".

GOAL
The admin uploads a résumé PDF. You must (a) recreate its visual layout as a self-contained HTML + Handlebars template, and (b) describe every field and section so the app can auto-generate a data-entry form. Different résumés have different sections and visual elements (e.g. a college logo) — capture exactly what THIS résumé contains.

"name": a short human label for the template (e.g. "Classic One-Column", "Modern Sidebar with Logo").

"schema": { "sections": TemplateSection[] }
- TemplateSection = { id, label, toggleable, repeatable, fields }
  - id: camelCase identifier, unique (e.g. "personal", "education", "workExperience", "projects", "skills", "achievements").
  - label: human title shown in the form.
  - toggleable: true if a client could reasonably hide this whole section (work experience, projects, achievements...). false for essential sections (personal/contact details).
  - repeatable: true if the section is a LIST of entries (education entries, jobs, projects). false for a single block (contact info, summary).
  - fields: TemplateField[] for ONE entry of the section.
- TemplateField = { id, label, type, required?, placeholder? }
  - id: camelCase, unique within the section.
  - type: one of text | textarea | month | date | url | email | phone | list | image.
    - Use "list" for bullet-point groups (job highlights, skill lists).
    - Use "image" for any logo/photo you see (e.g. a college logo, profile picture).
    - Use "month" for things like start/end dates.
  - Capture EVERY field visible in the résumé, including name, contact info, CGPA/GPA, school name, college name, dates, etc.

"html": a COMPLETE, self-contained HTML document (Handlebars template):
- Inline <style> only. No external CSS, fonts, scripts, or network requests.
- A4 page sizing; print-friendly; visually faithful to the uploaded résumé.
- Reference single-section fields as {{sectionId.fieldId}} (e.g. {{personal.fullName}}).
- Wrap each toggleable section in {{#ifSection "sectionId"}} ... {{/ifSection}}.
- For repeatable sections, iterate: {{#each sectionId}} ... {{this.fieldId}} ... {{/each}}.
- For "list" fields, iterate the array: {{#each this.fieldId}}<li>{{this}}</li>{{/each}} (or {{#each sectionId.fieldId}} for single-section lists).
- For "image" fields, render <img src="{{sectionId.fieldId}}" ...> so an uploaded logo URL appears.
- You MUST also include these generic loops so client-added content renders without regenerating the template:
  - Inside each section's container, after its known fields: {{#each sectionId._extraFields}}<div class="extra-field"><span class="extra-label">{{this.label}}:</span> {{this.value}}</div>{{/each}}
  - Near the end of the résumé body: {{#each customSections}}<section class="custom-section"><h2>{{this.label}}</h2>{{#each this.fields}}<div class="extra-field"><span class="extra-label">{{this.label}}:</span> {{this.value}}</div>{{/each}}</section>{{/each}}
- Handlebars auto-escapes values; do not add manual escaping.

Return only the JSON object — no prose, no markdown fences.`;

/**
 * Send a résumé PDF to Claude and get back a validated template + form schema.
 * @param pdfBase64 base64-encoded PDF bytes (no data: prefix).
 */
export async function generateTemplateFromPdf(
  pdfBase64: string,
): Promise<ClaudeGeneration> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: { format: OUTPUT_FORMAT },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: "Convert this résumé PDF into a template. Capture every section, field, and visual element (including any logos as image fields). Return the JSON object.",
          },
        ],
      },
    ],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error(
      "The résumé was too complex to fully process. Try a simpler PDF or regenerate.",
    );
  }

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("Claude did not return a template.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.text);
  } catch {
    throw new Error("Claude returned malformed JSON.");
  }

  return claudeGenerationSchema.parse(parsed);
}
