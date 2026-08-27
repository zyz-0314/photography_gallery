# Setting up the public site + admin

The archive lives in a **GitHub private repository** — no server, no database. The project is split into **two apps** that share the same repo:

```
D:\photography-gallery            # the public portfolio site — DEPLOY THIS
D:\photography_gallery_admin      # the hidden admin CMS — run locally, do NOT deploy
```

- The **admin** reads/writes `data/*.json` + `images/` in the repo.
- The **public site** only reads the repo (server-side token) and serves images through `/api/images/…`.

---

## Tokens

Create **two** fine-grained Personal Access Tokens at <https://github.com/settings/personal-access-tokens/new> (both: *Only select repositories* → the archive repo):

1. **Admin** — permission **Contents: Read and write**. Goes in `photography_gallery_admin/.env.local`.
2. **Public site** — permission **Contents: Read only**. Goes in `photography-gallery/.env.local`.

The public token can be read-only because the site never writes.

## Admin app (this machine only)

```bash
cd D:\photography_gallery_admin
cp .env.example .env.local        # fill: write token, repo owner/name, passcode
npm install
npm run dev                       # → http://localhost:3001
```

Open `http://localhost:3001` → passcode → **SETTINGS** → **CONNECT / CREATE REPOSITORY** (one-time: verifies the token, creates the private repo if missing, seeds `data/`). Then **UPLOAD** → publish.

## Public site (deploy this)

```bash
cd D:\photography-gallery
cp .env.example .env.local        # fill: READ-ONLY token, repo owner/name
npm install
npm run dev                       # → http://localhost:3000
```

Deploy this folder to your host (Vercel, etc.) and set the same three env vars there. The site renders the published archive at request time; admin uploads appear within ~60 seconds (the site's read cache).

---

## How it works

- **Data**: `data/photos.json`, `data/categories.json`, `data/locations.json`, `data/projects.json`, `data/settings.json`.
- **Images**: `images/<year>/<location>/<slug>.jpg` plus a generated `*.thumb.webp` thumbnail.
- The public site serves images through `/api/images/…` (token stays server-side; responses cached hard).
- Only **published** photos appear publicly; drafts stay in the admin.
- Changing the passcode in **Admin → Settings** stores an encrypted copy in the repo.

## Rate limits

GitHub's API allows 5000 requests/hour per token. Both apps cache reads briefly and images are cached by the browser, so a personal portfolio stays well within that.

## Notes

- The old static data files (`src/data/*.ts`) in the public site are a reference copy and no longer drive it.
- Every admin change is a real git commit in the repo — history is your undo button.
