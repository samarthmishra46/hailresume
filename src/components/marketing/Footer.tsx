import Link from "next/link";
import { SERVICES } from "@/lib/services";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-lg font-bold text-emerald-700">
            Hail<span className="text-slate-900">Resume</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Build a job-winning resume in minutes — with more career tools on the
            way.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Products</h3>
          <ul className="mt-3 space-y-2">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={s.href}
                  className="text-sm text-slate-600 hover:text-emerald-700"
                >
                  {s.name}
                  {s.status === "soon" && (
                    <span className="ml-1 text-xs text-slate-400">(soon)</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/about" className="text-sm text-slate-600 hover:text-emerald-700">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-slate-600 hover:text-emerald-700">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Get started</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/templates" className="text-sm text-slate-600 hover:text-emerald-700">
                Browse templates
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-sm text-slate-600 hover:text-emerald-700">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} HailResume. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
