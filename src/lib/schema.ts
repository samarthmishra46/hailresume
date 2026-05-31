import { z } from "zod";

// Zod schemas — validate both Claude's generated output and form-schema edits.

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "month",
  "date",
  "url",
  "email",
  "phone",
  "list",
  "image",
]);

export const templateFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export const templateSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  toggleable: z.boolean(),
  repeatable: z.boolean(),
  fields: z.array(templateFieldSchema),
});

export const templateSchemaSchema = z.object({
  sections: z.array(templateSectionSchema),
});

/** The strict JSON contract Claude must return when processing a resume PDF. */
export const claudeGenerationSchema = z.object({
  name: z.string().min(1),
  html: z.string().min(1),
  schema: templateSchemaSchema,
});

export type ClaudeGeneration = z.infer<typeof claudeGenerationSchema>;
