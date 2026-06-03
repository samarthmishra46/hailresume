// Presentational results panel for the ATS checker. No state — rendered by AtsForm.

export interface AtsScore {
  keywordScore: number;
  aiScore: number;
  combinedScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  tips: string[];
}

// How many keyword badges to show before collapsing into a "+N more" pill.
const MAX_BADGES = 24;

function scoreTone(score: number): { text: string; ring: string } {
  if (score >= 75) return { text: "text-emerald-600", ring: "text-emerald-500" };
  if (score >= 50) return { text: "text-amber-600", ring: "text-amber-500" };
  return { text: "text-red-600", ring: "text-red-500" };
}

// A circular gauge for the headline combined score.
function ScoreDial({ score }: { score: number }) {
  const tone = scoreTone(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-200"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={tone.ring}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${tone.text}`}>{score}</span>
        <span className="text-xs font-medium text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

function MiniScore({ label, score }: { label: string; score: number }) {
  const tone = scoreTone(score);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className={`text-2xl font-bold ${tone.text}`}>{score}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function KeywordBadges({
  keywords,
  variant,
}: {
  keywords: string[];
  variant: "matched" | "missing";
}) {
  const shown = keywords.slice(0, MAX_BADGES);
  const extra = keywords.length - shown.length;
  const cls =
    variant === "matched"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-red-50 text-red-700 ring-red-200";

  return (
    <div className="flex flex-wrap gap-2">
      {shown.map((kw) => (
        <span
          key={kw}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}
        >
          {kw}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-400">
          +{extra} more
        </span>
      )}
    </div>
  );
}

export function ScoreResult({ result }: { result: AtsScore }) {
  return (
    <div className="space-y-6">
      {/* Headline scores */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <div className="flex flex-col items-center">
            <ScoreDial score={result.combinedScore} />
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Combined score
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3">
            <MiniScore label="Keyword match" score={result.keywordScore} />
            <MiniScore label="AI assessment" score={result.aiScore} />
            <p className="col-span-2 text-xs text-slate-500">
              Combined = 40% keyword match + 60% AI assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Matched keywords{" "}
            <span className="text-slate-400">({result.matchedKeywords.length})</span>
          </h3>
          <div className="mt-3">
            {result.matchedKeywords.length > 0 ? (
              <KeywordBadges keywords={result.matchedKeywords} variant="matched" />
            ) : (
              <p className="text-sm text-slate-400">No overlapping keywords yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Missing keywords{" "}
            <span className="text-slate-400">({result.missingKeywords.length})</span>
          </h3>
          <div className="mt-3">
            {result.missingKeywords.length > 0 ? (
              <KeywordBadges keywords={result.missingKeywords} variant="missing" />
            ) : (
              <p className="text-sm text-slate-400">
                Nice — your resume covers every keyword we found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      {result.tips.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-900">
            How to improve
          </h3>
          <ul className="mt-3 space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-emerald-800">
                <span aria-hidden className="text-emerald-500">
                  →
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
