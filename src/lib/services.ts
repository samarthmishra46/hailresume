// Central catalog of HailResume services — used by the nav, footer, landing
// grid, and the coming-soon pages so everything stays in sync.

export type ServiceStatus = "live" | "soon";

export interface Service {
  slug: string; // also the coming-soon route param
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: ServiceStatus;
  emoji: string;
}

export const SERVICES: Service[] = [
  {
    slug: "resume-builder",
    name: "Resume Builder",
    tagline: "Pick a template, fill in details, download a polished PDF.",
    description:
      "Choose from recruiter-ready templates, fill a smart form, toggle sections, add custom fields, preview live, and export an ATS-friendly PDF.",
    href: "/templates",
    status: "live",
    emoji: "📝",
  },
  {
    slug: "resume-review",
    name: "Resume Review",
    tagline: "Instant, recruiter-grade feedback on your resume.",
    description:
      "Upload your resume and get a clear score plus line-by-line suggestions modeled on what top recruiters look for.",
    href: "/resume-review",
    status: "live",
    emoji: "🔍",
  },
  {
    slug: "ats-score",
    name: "ATS Score Checker",
    tagline: "See how your resume scores against a job description.",
    description:
      "Paste a job posting and we'll flag missing keywords and skills so your resume sails through applicant tracking systems.",
    href: "/ats-score",
    status: "live",
    emoji: "📊",
  },
  {
    slug: "cover-letter",
    name: "Cover Letter Builder",
    tagline: "Generate a tailored cover letter in seconds.",
    description:
      "Turn your resume and a job description into a polished, personalized cover letter you can edit and download.",
    href: "/cover-letter",
    status: "live",
    emoji: "✉️",
  },
  {
    slug: "linkedin-review",
    name: "LinkedIn Review",
    tagline: "Optimize your profile to attract recruiters.",
    description:
      "Get actionable feedback on your headline, About section, and experience so recruiters find and message you.",
    href: "/linkedin-review",
    status: "soon",
    emoji: "💼",
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
