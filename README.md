# Resume Builder

A multi-tenant résumé builder. **Admins** upload a sample résumé PDF; Claude Sonnet turns it into an editable HTML template **and** auto-detects its form fields (including template-specific elements like a college logo). **Clients** sign in with Google, pick a published template, fill the auto-generated form (toggling sections, adding repeatable entries, custom fields, and image uploads), see a live preview, and download a polished A4 PDF.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — Postgres (with RLS), Storage, and Google OAuth
- **Anthropic** `claude-sonnet-4-6` — processes uploaded résumé PDFs (structured outputs + prompt caching)
- **Handlebars** — template rendering; **puppeteer-core + @sparticuz/chromium** — server-side PDF
- Deploys to **Vercel**

## Architecture

Each template carries its **own form definition**. Claude returns `{ name, html (Handlebars), schema }`:

- `html_template` — a self-contained, print-ready Handlebars document.
- `schema.sections[]` — each section has `toggleable` / `repeatable` flags and typed `fields[]`. This JSON drives the client's dynamic form, so a template with a logo automatically gets an image-upload field.

Client-added custom fields render through generic `{{#each sectionId._extraFields}}` / `{{#each customSections}}` loops that Claude is instructed to include in every template.

```
Admin: upload PDF → /api/templates/generate (Claude) → draft template → review/edit → publish
Client: pick template → /builder/[resumeId] (DynamicForm + live preview) → /api/resumes/[id]/pdf
```

Key files: [src/lib/anthropic.ts](src/lib/anthropic.ts), [src/lib/handlebars.ts](src/lib/handlebars.ts), [src/lib/pdf.ts](src/lib/pdf.ts), [src/components/builder/DynamicForm.tsx](src/components/builder/DynamicForm.tsx), [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql).

## Setup

### 0. Node

Requires **Node ≥ 20.9** (Next 16). An `.nvmrc` pins Node 22 — run `nvm use`.

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql). This creates the `profiles`, `templates`, `resumes` tables, RLS policies, the signup trigger, and the `resume-pdfs` (private) + `logos` (public) storage buckets.
3. **Authentication → Providers → Google**: enable it and paste a Google OAuth **Client ID/Secret** (from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)). Add the Supabase callback URL shown on that page to the Google client's "Authorized redirect URIs".
4. **Authentication → URL Configuration**: set the Site URL (e.g. `http://localhost:3000`) and add it to Redirect URLs.

### 2. Environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…        # server-only
ANTHROPIC_API_KEY=…                # server-only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run

```bash
nvm use
npm install
npm run dev
```

Visit `http://localhost:3000` and sign in with Google. To become an admin, run in the Supabase SQL editor **after your first login**:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Then `/admin/templates` becomes available.

### Local PDF export

`src/lib/pdf.ts` uses bundled Chromium on Vercel and a **local Chrome** in dev. If Chrome isn't auto-detected, set `PUPPETEER_EXECUTABLE_PATH` to your Chrome binary.

## Deploy to Vercel

1. Push to a Git repo and import it in Vercel.
2. Set **Node.js Version = 20.x** (or 22) in project settings.
3. Add all env vars from `.env.local`, setting `NEXT_PUBLIC_SITE_URL` to the production domain.
4. In Supabase, add the production domain to **Auth → URL Configuration** redirect URLs.
5. The PDF route uses `@sparticuz/chromium`; `serverExternalPackages` in [next.config.ts](next.config.ts) keeps it out of the bundle so it loads at runtime.

## How to use

- **Admin:** upload a résumé PDF → review the generated template (edit field labels/types, toggle section flags, tweak the HTML) → **Publish**.
- **Client:** **Use this template** → fill the form, hide sections you don't need, add entries/custom fields, upload a logo → **Download PDF**.
# hailresume
