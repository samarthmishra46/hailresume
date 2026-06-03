import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// Server-only Claude client. Reuses the app owner's key, same as lib/anthropic.ts.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sonnet matches the rest of the app (see lib/anthropic.ts). A scoring pass is
// classification-like, so thinking is disabled and effort kept low for speed.
const MODEL = "claude-sonnet-4-6";

export type ExperienceLevel = "fresher" | "mid" | "senior";

export interface AtsAssessment {
  keywordScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  aiScore: number;
  tips: string[];
}

/**
 * Match Claude-extracted job-description keywords against the résumé text.
 * Case-insensitive substring match; preserves Claude's casing for display.
 */
function matchKeywords(
  resumeText: string,
  keywords: string[],
): Pick<AtsAssessment, "keywordScore" | "matchedKeywords" | "missingKeywords"> {
  const resumeLower = resumeText.toLowerCase();
  const seen = new Set<string>();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const raw of keywords) {
    const keyword = raw.trim();
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue; // de-dupe case-insensitively
    seen.add(key);
    if (resumeLower.includes(key)) matchedKeywords.push(keyword);
    else missingKeywords.push(keyword);
  }

  const total = matchedKeywords.length + missingKeywords.length;
  const keywordScore =
    total === 0 ? 0 : Math.round((matchedKeywords.length / total) * 100);

  return { keywordScore, matchedKeywords, missingKeywords };
}

// Structured-output contract. `keywords` are the relevant terms Claude pulls
// from the JD; structured outputs require `additionalProperties: false`.
const OUTPUT_FORMAT = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      s: { type: "integer" },
      keywords: { type: "array", items: { type: "string" } },
      tips: { type: "array", items: { type: "string" } },
    },
    required: ["s", "keywords", "tips"],
  },
};

const assessmentSchema = z.object({
  s: z.number(),
  keywords: z.array(z.string()),
  tips: z.array(z.string()),
});

// Stable system prompt — cached so repeated scorings reuse the prefix. All
// volatile content (résumé, JD, level) goes in the user turn to keep this byte-identical.
const SYSTEM_PROMPT = `You are an ATS (applicant tracking system) résumé scorer. Given a job description, a résumé, and the candidate's experience level, return ONLY valid JSON matching the schema — no prose, no markdown.

Fields:
- "keywords": the key skills, tools, technologies, and qualifications REQUIRED BY THE JOB DESCRIPTION. Extract only meaningful, role-relevant terms (e.g. "React", "TypeScript", "CI/CD", "Kubernetes", "stakeholder management") — never filler words like "we", "how", "enjoy", "team player". Prefer concise canonical terms over long phrases. Base these on the job description only, not the résumé. Return up to 20.
- "s": an integer 0-100 for how well the résumé matches the job for someone at this experience level.
- "tips": up to 3 improvement tips, each under 10 words.`;

/** One Claude pass: extract JD keywords, score the résumé, and suggest tips. */
export async function getAtsAssessment(
  resumeText: string,
  jobDescription: string,
  experienceLevel: ExperienceLevel,
): Promise<AtsAssessment> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    thinking: { type: "disabled" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: { effort: "low", format: OUTPUT_FORMAT },
    messages: [
      {
        role: "user",
        content: `Job description:\n${jobDescription.slice(0, 2500)}\n\nResume:\n${resumeText.slice(0, 1500)}\n\nCandidate experience level: ${experienceLevel}`,
      },
    ],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("The AI response was cut off. Please try again.");
  }

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude did not return an assessment.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(block.text);
  } catch {
    throw new Error("Claude returned malformed JSON.");
  }

  const { s, keywords, tips } = assessmentSchema.parse(parsed);

  return {
    ...matchKeywords(resumeText, keywords),
    aiScore: Math.max(0, Math.min(100, Math.round(s))),
    tips: tips.map((t) => t.trim()).filter(Boolean).slice(0, 3),
  };
}
