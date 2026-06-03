import Anthropic from "@anthropic-ai/sdk";
import type { ExperienceLevel } from "@/lib/ats";
import type { Tone } from "@/lib/coverLetterTypes";

// Server-only Claude client. Reuses the app owner's key, same as lib/anthropic.ts.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sonnet matches the rest of the app. Cover letters are short, so effort stays
// low and thinking is disabled to keep it fast and token-efficient.
const MODEL = "claude-sonnet-4-6";

// Stable system prompt — cached so repeated generations reuse the prefix. The
// tone is volatile (changes on regenerate) so it lives in the user turn.
const SYSTEM_PROMPT =
  "You are a professional cover letter writer. Write in the tone specified. Return only the cover letter text — no explanation, no subject line, no placeholders like [Company].";

export interface CoverLetterInput {
  name: string;
  resumeText: string;
  jobDescription: string;
  experienceLevel: ExperienceLevel;
  tone: Tone;
}

/** Generate a tailored cover letter and return its plain text. */
export async function generateCoverLetter({
  name,
  resumeText,
  jobDescription,
  experienceLevel,
  tone,
}: CoverLetterInput): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    thinking: { type: "disabled" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: { effort: "low" },
    messages: [
      {
        role: "user",
        content: `Name: ${name}
Resume: ${resumeText.slice(0, 1500)}
Job description: ${jobDescription.slice(0, 800)}
Experience level: ${experienceLevel}
Tone: ${tone}

Write a cover letter. Max 3 paragraphs. Under 250 words.
Para 1: Why this role — mention the company and role name from the JD.
Para 2: 2-3 specific skills from the resume that match the JD.
Para 3: Short closing with a call to action.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  const text = block && block.type === "text" ? block.text.trim() : "";
  if (!text) {
    throw new Error("Claude did not return a cover letter. Please try again.");
  }
  return text;
}
