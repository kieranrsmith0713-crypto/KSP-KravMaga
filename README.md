# 🥋 KSP Krav Maga

Track your progress in Krav Maga class — classes attended, the techniques in
your syllabus and how well you know them, and your gradings. Part of **The
Hub**, KSP's family of personal apps (Finance, Notes, Calendar, Todo, …),
built with **Vite + React + TypeScript**, backed by **Supabase**, and
installable as a **PWA**.

## What's in the box

- **Dashboard** — classes this month, total mat time, current level (your
  latest passed grading), countdown to your next grading, technique
  confidence bar, and recent classes
- **Classes** — log a class (date, minutes, type, intensity 1–5, notes) and
  browse your history
- **Techniques** — your notebook of what you've learnt: search, filter by
  category (pick a suggested one or type your own), grouped by category
- **Technique page** — a numbered step-by-step breakdown with an optional
  key point per step, notes, level, the date you learnt it, and a rating from
  "Introduced" to "Second nature"; edit, reorder, add, and remove steps
- **Gradings** — upcoming dates and past results
- Delete with the shared confirm-dialog pattern
- Installable PWA (offline shell, home-screen icon, standalone display)
- Mobile-first dark UI that scales up nicely on a tablet

## Auth: owned by KSP Hub, not this app

Krav Maga has **no login screen of its own**. It shares one Supabase project
with the rest of the Hub, and reads the session cookie set by
`hub.ksponline.co.uk`:

- If there's no session, the app redirects to `hub.ksponline.co.uk/login`.
- Once signed in, access to Krav Maga specifically is gated by the Hub's
  `user_app_access` table (`app_id = 'krav-maga'`), managed from the Hub's
  admin panel — see [`src/auth/useAppAccess.ts`](src/auth/useAppAccess.ts).

## Prerequisites

- Node.js 18+
- The **same** Supabase project used by KSP Hub — Krav Maga must not point at
  a separate project, or the shared session cookie won't resolve to a real
  session here.
- A GitHub token with `read:packages` for the private
  `@kieranrsmith0713-crypto/hub-foundations` package, exposed as `NPM_TOKEN`
  (see [`.npmrc`](.npmrc)).

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

1. Open the shared Supabase project's dashboard → **SQL Editor** and run
   [`db/schema.sql`](db/schema.sql). This creates the `krav_classes`,
   `krav_techniques`, and `krav_gradings` tables and their Row Level Security
   policies. (The `user_app_access` table already exists — it's owned by KSP
   Hub.)
2. Open **Project Settings → API** and copy the **Project URL** and the
   **anon / public** key.
3. Create your local env file:

   ```bash
   cp .env.example .env
   ```

   Then fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 3. Register the app in KSP Hub

In the KSP-Hub repo:

1. Add an entry to `src/data/apps.ts`:

   ```ts
   {
     id: 'krav-maga',
     name: 'Krav Maga',
     description: 'Classes, techniques, and gradings',
     host: 'kravmaga.ksponline.co.uk',
     icon: KravMagaIcon,
   },
   ```

   (plus a `KravMagaIcon` in `src/components/icons.tsx`).
2. Grant access — either from the Hub admin panel, or with a migration
   following `0006_add_darts_app.sql`:

   ```sql
   insert into public.user_app_access (user_id, app_id)
   select id, 'krav-maga' from auth.users
   on conflict (user_id, app_id) do nothing;
   ```

## 4. Run locally

```bash
npm run dev
```

Open the printed URL. Since Krav Maga has no local login, you'll need to
sign in via the Hub app (or seed a session cookie for `localhost` manually
while developing) and have a `user_app_access` row for
`app_id = 'krav-maga'`.

## 5. Build

```bash
npm run build      # type-checks then bundles to dist/
npm run preview    # serves the production build locally
```

## 6. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo. Vercel auto-detects
   Vite (see [`vercel.json`](vercel.json)).
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `NPM_TOKEN` under
   the project's **Settings → Environment Variables** — Supabase values the
   same as the rest of the Hub.
4. Deploy behind the `kravmaga.ksponline.co.uk` subdomain so the shared
   session cookie applies.

## Install on your phone / tablet

Open the deployed site in Chrome, then **⋮ → Add to Home screen**.

## Project structure

```
db/schema.sql                krav_classes / krav_techniques / krav_gradings + RLS
public/                      PWA icons, favicon
scripts/generate-icons.mjs   Regenerates the PNG icons
src/
  auth/                      Auth context/provider, useAuth, useAppAccess (Hub SSO gate)
  components/                Layout (app shell/nav/drawer), KSPLogo, confirm dialog
  lib/
    supabase.ts              Supabase client (shared Hub project, cross-subdomain cookie)
    classes.ts               Class log queries + class types
    techniques.ts            Technique queries, categories, proficiency labels
    gradings.ts              Grading queries + current level / next grading
    date.ts                  Local-date helpers (YYYY-MM-DD columns, durations)
  pages/                     Dashboard, Classes, Techniques, TechniqueDetail, Gradings
  styles/kravmaga.css        App-specific styles (shared ones come from hub-foundations)
  types/database.ts          Typed schema for the client
  App.tsx                    Hub SSO gate (loading / redirect / access check) + routes
  main.tsx                   App entry
```

The icons in `public/` are generated — regenerate with
`node scripts/generate-icons.mjs` (requires
`npm install --no-save playwright` first) or drop in your own PNGs.
