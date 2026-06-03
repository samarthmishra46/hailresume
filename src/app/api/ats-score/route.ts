import { NextResponse, type NextRequest } from "next/server";
import { extractTextFromFile } from "@/lib/extractText";
import { requireUserApi } from "@/lib/auth";
import { getAtsAssessment, type ExperienceLevel } from "@/lib/ats";

// pdf-parse / mammoth need Node APIs; Claude can also take a moment.
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const LEVELS: ExperienceLevel[] = ["fresher", "mid", "senior"];

// Uploaded résumé (PDF/DOCX) + job description + experience level -> scores + tips.
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

  // 1. Extract résumé text.
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

  // 2. One Claude pass: extract relevant JD keywords (matched in JS against the
  //    résumé), score the résumé, and suggest tips.
  let assessment;
  try {
    assessment = await getAtsAssessment(resumeText, jobDescription, level);
  } catch (e) {
    const error = e instanceof Error ? e.message : "AI scoring failed.";
    return NextResponse.json({ error }, { status: 502 });
  }

  const { keywordScore, aiScore, matchedKeywords, missingKeywords, tips } =
    assessment;
  const combinedScore = Math.round(keywordScore * 0.4 + aiScore * 0.6);

  return NextResponse.json({
    keywordScore,
    aiScore,
    combinedScore,
    matchedKeywords,
    missingKeywords,
    tips,
  });
}
