import { FullPageLoader } from "@/components/Loader";

// Fallback loader for top-level route transitions (e.g. the initial redirect).
export default function Loading() {
  return <FullPageLoader />;
}
