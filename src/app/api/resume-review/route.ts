import { NextResponse, type NextRequest } from "next/server";
import { extractTextFromFile } from "@/lib/extractText";
import { requireUserApi } from "@/lib/auth";
import type { ExperienceLevel } from "@/lib/ats";
import { generateResumeReview } from "@/lib/resumeReview";

// pdf-parse / mammoth need Node APIs; a full review can take a while.
export const runtime = "nodejs";
export const maxDuration = 90;

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const LEVELS: ExperienceLevel[] = ["fresher", "mid", "senior"];

// Uploaded résumé (PDF/DOCX) + JD + level + target role -> structured review.
export async function POST(request: NextRequest) {
  const auth = await requireUserApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form submission." },
      { status: 400 },
    );
  }

  const file = formData.get("resume");
  const jobDescription = (formData.get("jobDescription") ?? "").toString();
  const experienceLevel = (formData.get("experienceLevel") ?? "").toString();
  const targetRole = (formData.get("targetRole") ?? "").toString().trim();

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Please upload your resume (PDF or DOCX)." },
      { status: 400 },
    );
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
    return NextResponse.json(
      { error: "Unsupported file type. Only PDF and DOCX allowed." },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 5MB." },
      { status: 413 },
    );
  }

  if (!jobDescription.trim()) {
    return NextResponse.json(
      { error: "Please paste the job description." },
      { status: 400 },
    );
  }

  const level: ExperienceLevel = LEVELS.includes(
    experienceLevel as ExperienceLevel,
  )
    ? (experienceLevel as ExperienceLevel)
    : "mid";

  // 1. Extract résumé text (reuses the ATS text extractor).
  let resumeText: string;
  try {
    resumeText = await extractTextFromFile(file);
  } catch (e) {
    const error = e instanceof Error ? e.message : "Could not read the file.";
    return NextResponse.json({ error }, { status: 422 });
  }

  if (!resumeText.trim()) {
    return NextResponse.json(
      {
        error:
          "We couldn't read any text from that file. If it's a scanned PDF, try a text-based one.",
      },
      { status: 422 },
    );
  }

  // 2. Generate the structured review (Claude).
  try {
    const review = await generateResumeReview({
      resumeText,
      jobDescription,
      experienceLevel: level,
      targetRole,
    });
    return NextResponse.json(review);
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed to generate review.";
    return NextResponse.json({ error }, { status: 502 });
  }
}
