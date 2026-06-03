import type { Metadata } from "next";
import { AtsForm } from "@/components/ats/AtsForm";
import { getService } from "@/lib/services";

const service = getService("ats-score")!;

export const metadata: Metadata = {
  title: `${service.name} — HailResume`,
  description: service.description,
};

export default function AtsScorePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <span className="mb-4 inline-block text-5xl">{service.emoji}</span>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {service.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          {service.description}
        </p>
      </div>

      <div className="mt-10">
        <AtsForm />
      </div>
    </section>
  );
}
