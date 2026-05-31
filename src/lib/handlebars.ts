import Handlebars from "handlebars";
import type { ResumeData, TemplateSchema } from "@/lib/types";

// A constrained Handlebars instance. We register only a few safe helpers and
// rely on default HTML-escaping for all user values.
const hb = Handlebars.create();

// {{#ifSection "workExperience"}} ... {{/ifSection}} — true unless toggled off.
hb.registerHelper(
  "ifSection",
  function (this: unknown, id: string, options: Handlebars.HelperOptions) {
    const sections = (options.data?.root?.sections ?? {}) as Record<
      string,
      boolean
    >;
    const on = sections[id] !== false; // default on
    return on ? options.fn(this) : options.inverse(this);
  },
);

// {{nl2br text}} — render newlines as <br> (output is escaped first).
hb.registerHelper("nl2br", function (text: unknown) {
  const escaped = Handlebars.Utils.escapeExpression(String(text ?? ""));
  return new Handlebars.SafeString(escaped.replace(/\n/g, "<br>"));
});

/** Compile + render a template's Handlebars HTML against resume data. */
export function renderResumeHtml(
  htmlTemplate: string,
  data: ResumeData,
): string {
  const template = hb.compile(htmlTemplate, { noEscape: false });
  return template(data);
}

/** Build placeholder data so admins can preview a template before any client fills it. */
export function buildSampleData(schema: TemplateSchema): ResumeData {
  const data: ResumeData = { sections: {} };
  for (const section of schema.sections) {
    data.sections![section.id] = true;
    const entry: Record<string, unknown> = {};
    for (const field of section.fields) {
      switch (field.type) {
        case "list":
          entry[field.id] = [`${field.label} item one`, `${field.label} item two`];
          break;
        case "image":
          entry[field.id] = "https://placehold.co/120x120?text=Logo";
          break;
        case "month":
        case "date":
          entry[field.id] = "2023-01";
          break;
        default:
          entry[field.id] = `Sample ${field.label}`;
      }
    }
    data[section.id] = section.repeatable ? [entry, { ...entry }] : entry;
  }
  return data;
}

// Re-export the escape utility for callers that build HTML manually.
export const escapeHtml = Handlebars.Utils.escapeExpression;
