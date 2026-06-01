"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/lib/services";

const NAV_LINKS = [
  ...SERVICES.map((s) => ({ label: s.name, href: s.href })),
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Public marketing nav with a responsive mobile menu. `loggedIn` drives the CTA.
export function MarketingHeader({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const cta = loggedIn
    ? { label: "Go to my resumes", href: "/templates" }
    : { label: "Sign in", href: "/login" };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="text-xl font-bold tracking-tight text-emerald-700">
            Hail<span className="text-slate-900">Resume</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-600 transition hover:text-emerald-700"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            {cta.label}
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-slate-100 py-3 text-slate-700 last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-3 mb-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              {cta.label}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
