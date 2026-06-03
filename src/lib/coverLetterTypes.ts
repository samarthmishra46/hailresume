// Client-safe cover-letter constants/types. Kept separate from coverLetter.ts
// (which instantiates the server-only Anthropic client) so client components can
// import these without pulling the SDK into the browser bundle.

export type Tone = "formal" | "friendly" | "confident";

export const TONES: Tone[] = ["formal", "friendly", "confident"];

export const TONE_LABELS: Record<Tone, string> = {
  formal: "Formal",
  friendly: "Friendly",
  confident: "Confident",
};
