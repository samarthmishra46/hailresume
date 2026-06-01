import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact — HailResume",
  description: "Questions, feedback, or partnership ideas? Get in touch with the HailResume team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-20">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Contact us
      </h1>
      <p className="mt-4 text-slate-600">
        Have a question, found a bug, or want to suggest a feature? Send us a
        message and we&apos;ll get back to you.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
