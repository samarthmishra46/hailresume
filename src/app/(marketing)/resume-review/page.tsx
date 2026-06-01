import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/ComingSoon";
import { getService } from "@/lib/services";

const service = getService("resume-review")!;

export const metadata: Metadata = {
  title: `${service.name} — HailResume`,
  description: service.description,
};

export default function ResumeReviewPage() {
  return (
    <ComingSoon
      service={service.slug}
      name={service.name}
      emoji={service.emoji}
      description={service.description}
    />
  );
}
