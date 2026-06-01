// A simple spinner. Use <Loader /> inline or <FullPageLoader /> centered.
export function Loader({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 ${className}`}
    />
  );
}

export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
