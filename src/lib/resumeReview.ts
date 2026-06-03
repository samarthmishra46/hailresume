import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ExperienceLevel } from "@/lib/ats";

// Server-only Claude client. Reuses the app owner's key, same as lib/anthropic.ts.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sonnet matches the rest of the app. A substantive review benefits from a bit
// more effort than the ATS/cover-letter passes; thinking stays off for latency.
const MODEL = "claude-sonnet-4-6";

const reviewSchema = z.object({
  overallScore: z.number(),
  summary: z.string(),
  pros: z.array(z.object({ point: z.string(), detail: z.string() })),
  cons: z.array(z.object({ point: z.string(), detail: z.string() })),
  changes: z.array(
    z.object({
      section: z.string(),
      current: z.string(),
      suggestion: z.string(),
    }),
  ),
  skillsToLearn: z.array(
    z.object({
      skill: z.string(),
      reason: z.string(),
      resource: z.string(),
    }),
  ),
  formatIssues: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
});

export type Review = z.infer<typeof reviewSchema>;

// Structured-output contract. Mirrors `reviewSchema`; structured outputs require
// `additionalProperties: false` on every object. (Item-count rules live in the
// prompt — JSON Schema min/maxItems isn't enforced by structured outputs.)
const obj = (properties: Record<string, unknown>, required: string[]) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});
const str = { type: "string" };

const OUTPUT_FORMAT = {
  type: "json_schema" as const,
  schema: obj(
    {
      overallScore: { type: "integer" },
      summary: str,
      pros: {
        type: "array",
        items: obj({ point: str, detail: str }, ["point", "detail"]),
      },
      cons: {
        type: "array",
        items: obj({ point: str, detail: str }, ["point", "detail"]),
      },
      changes: {
        type: "array",
        items: obj({ section: str, current: str, suggestion: str }, [
          "section",
          "current",
          "suggestion",
        ]),
      },
      skillsToLearn: {
        type: "array",
        items: obj({ skill: str, reason: str, resource: str }, [
          "skill",
          "reason",
          "resource",
        ]),
      },
      formatIssues: { type: "array", items: str },
      keywordsMissing: { type: "array", items: str },
    },
    [
      "overallScore",
      "summary",
      "pros",
      "cons",
      "changes",
      "skillsToLearn",
      "formatIssues",
      "keywordsMissing",
    ],
  ),
};

// Stable system prompt — cached so repeated reviews reuse the prefix. Content
// rules live here (stable); only the résumé/JD/role/level go in the user turn.
const SYSTEM_PROMPT = `You are a senior technical recruiter and career coach with 15 years of experience reviewing resumes for top tech companies. Review the candidate's resume against the target role and job description, and return ONLY valid JSON matching the schema.

Rules:
- overallScore: integer 0-100.
- summary: a 2-sentence overall impression.
- pros: 3-6 strengths, each with a short "point" title and a 1-sentence "detail".
- cons: 3-6 weaknesses, each with a short "point" title and a 1-sentence "detail".
- changes: 3-6 specific, actionable edits. "section" is the resume section, "current" quotes what it says now, "suggestion" is the improved wording and why.
- skillsToLearn: 3-5 items. "reason" is why it matters for the role; "resource" is one free resource to learn it.
- formatIssues: up to 4 short strings.
- keywordsMissing: important keywords from the job description absent from the resume.
- Keep every text field concise — under 20 words.
- Base everything strictly on the provided resume and job description.`;

export interface ReviewInput {
  resumeText: string;
  jobDescription: string;
  experienceLevel: ExperienceLevel;
  targetRole: string;
}

/** Generate a structured, validated resume review. */
export async function generateResumeReview({
  resumeText,
  jobDescription,
  experienceLevel,
  targetRole,
}: ReviewInput): Promise<Review> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    thinking: { type: "disabled" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: { effort: "medium", format: OUTPUT_FORMAT },
    messages: [
      {
        role: "user",
        content: `Target role: ${targetRole || "(not specified)"}\nExperience level: ${experienceLevel}\n\nJob description:\n${jobDescription.slice(0, 1000)}\n\nResume:\n${resumeText.slice(0, 2000)}`,
      },
    ],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("The review was cut off. Please try again.");
  }

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude did not return a review.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(block.text);
  } catch {
    throw new Error("Failed to parse review.");
  }

  const review = reviewSchema.parse(parsed);
  review.overallScore = Math.max(0, Math.min(100, Math.round(review.overallScore)));
  return review;
}
