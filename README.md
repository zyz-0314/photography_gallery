# R1YADJAME — Photography Archive

A dark, cinematic, editorial photography portfolio. **One photographic archive, three ways to explore it** — MAIN (selected work), COLLECTIONS (subject), MAP (geography). Every photograph lives in the archive once; pages never reference images directly, they filter by metadata.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lenis (smooth scroll), a custom d3-geo world map — and a **GitHub private repository** as the archive's single source of truth.

---

## The CMS — two apps, one repo

The archive is managed from a **separate admin app** that runs on your machine (`D:\photography_gallery_admin`, port 3001) — it is **not** deployed to this site's domain. The two apps share the same GitHub private repository:

- **This app** (the public site) only *reads* the repo — published photos appear automatically on MAIN / COLLECTIONS / MAP.
- **The admin app** uploads, edits and publishes through the repo; changes appear on the deployed site within ~60 s.

Only **published** photographs are visible to visitors; drafts stay in the admin.

### Setting up GitHub storage (once)

Two tokens: a **read-only** one for this public site, a **read-write** one for the admin app. Put `GITHUB_TOKEN`, `GITHUB_REPO_OWNER` and `GITHUB_REPO_NAME` in each app's `.env.local`, then in the admin → **SETTINGS** → *Connect / Create repository* once. Full step-by-step: **`SETUP.md`**.

```
.env.local   # GITHUB_TOKEN + repo owner/name + admin passcode + session secret (gitignored)
SETUP.md     # how to create the token and connect the repo
```

---

## Quick start

```bash
npm install
npm run dev      # → http://localhost:3000
```

Production build: `npm run build && npm run start`

The public site is **repo-only** — it renders strictly from the GitHub repository, so before you upload anything the archive is empty (by design).

---

## Public routes

| Route | Page |
| --- | --- |
| `/` | MAIN |
| `/about` · `/contact` | Anchor sections on MAIN (`/#about`, `/#contact`) |
| `/collections` | COLLECTIONS posters |
| `/collections/<slug>` | A collection archive (distinct layout per subject) |
| `/map` | Interactive map (mobile shows a journal timeline instead) |
| `/location/<slug>` | A place's visual travel diary |
| `/project/<slug>` | An editorial project chapter |

The admin's routes (`/admin/*`, `/api/admin/upload`) live in the separate `photography_gallery_admin` app.

## Editing site copy

Almost all words on the site live in `src/data/site.ts` — hero headline, about text, philosophy, tools, contact details, copyright. One file.

## Scripts

- `npm run dev` / `npm run build` / `npm run start` — Next.js
- `npm run lint` — ESLint

## Architecture notes

- **The archive lives in a GitHub private repo.** `src/lib/archive.ts` (server-only) is the public data layer — it reads the JSON files in `data/` and hydrates them into `Photograph` DTOs; pages render at request time so a publish is live instantly. Admin reads/writes go through the same JSON files behind the passcode session (`src/lib/store.ts`, `src/lib/admin.ts`, `src/lib/actions.ts`).
- **Images** live in `images/` and are served to the public through `/api/images/…`, which streams the bytes with the server-side token and caches hard — the token never reaches the browser.
- **Uploads** go through `/api/admin/upload` (a route handler, to avoid the server-action body limit): a sharp thumbnail is generated and pushed into the repo together with the original, then the record is appended to `photos.json`.
- **SmartImage** renders images lazily with a cinematic grain placeholder while loading.
- **Lightbox** is a global provider (`useLightbox()`); keyboard arrows + Esc, camera/lens metadata in the footer.
- **Map** is custom minimal cartography: Natural Earth projection (d3-geo) over vendored world-atlas data, three zoom levels animated with springs, constant-size markers, and a hover preview panel. No Google Maps.
- **Motion language** is deliberately slow (0.8–1.6s fades/springs). Smooth scroll runs on desktop only; reduced-motion users get instant scroll.

## Old static archive (reference)

`src/data/photographs.ts`, `locations.ts`, `collections.ts` and `projects.ts` remain as a reference copy of the original hand-curated archive but no longer drive the site. Delete them once your real photographs are in the CMS.
"# photography_gallery" 
