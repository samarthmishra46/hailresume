"use client";

import { useFormStatus } from "react-dom";
import { Loader } from "@/components/Loader";

// A form submit button that shows a spinner while the form's server action runs.
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-70 ${className}`}
    >
      {pending && (
        <Loader className="h-4 w-4 border-current/30 border-t-current" />
      )}
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}
