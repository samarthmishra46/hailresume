// Shared domain types for the resume builder.

export type FieldType =
  | "text"
  | "textarea"
  | "month"
  | "date"
  | "url"
  | "email"
  | "phone"
  | "list"
  | "image";

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
}

export interface TemplateSection {
  id: string;
  label: string;
  /** Can the client hide this whole section? */
  toggleable: boolean;
  /** Is this a list of entries (e.g. multiple jobs) rather than a single block? */
  repeatable: boolean;
  fields: TemplateField[];
}

export interface TemplateSchema {
  sections: TemplateSection[];
}

export type Role = "client" | "admin";
export type TemplateStatus = "draft" | "published";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  status: TemplateStatus;
  created_by: string | null;
  source_pdf_path: string | null;
  html_template: string;
  schema: TemplateSchema;
  thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  data: ResumeData;
  created_at: string;
  updated_at: string;
}

/** A custom field the client adds to an existing section. */
export interface ExtraField {
  label: string;
  value: string;
}

/** A whole custom section the client adds. */
export interface CustomSection {
  label: string;
  fields: ExtraField[];
}

/**
 * The shape of `resumes.data`. Keys map to section ids from the template schema.
 * - non-repeatable section -> Record<fieldId, value>
 * - repeatable section      -> Array<Record<fieldId, value>>
 * `sections` holds on/off state for toggleable sections (default on).
 */
export interface ResumeData {
  sections?: Record<string, boolean>;
  customSections?: CustomSection[];
  // Section values live at the top level keyed by section id. The loose index
  // signature keeps the dynamic form flexible; helpers narrow as needed.
  [sectionId: string]: unknown;
}
