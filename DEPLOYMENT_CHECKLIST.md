# Deployment checklist: Backyard Vendor

Fill this in for each production release. Tick an item only after you have checked it.

**Release:** capstone v1.0 · **Date:** **28/09/2026** · **Commit:** 6e7af07 · **Signed off by:** Keith Metto

## Before merge

- [x] `npm run lint` passes
- [x] `npm test` passes (80 tests passed, 9 files)
- [x] `npm run build` succeeds locally
- [x] No secrets in the diff (`.env.local` is git-ignored and untracked; no API keys found in tracked files)
- [x] README setup steps still match reality (fresh clone → `npm install && npm run dev`)

## Environment

- [x] `GOOGLE_GENERATIVE_AI_API_KEY` set in Vercel for **Preview** and **Production** (verified: `/api/draft-listing` returns 200 on both)
- [x] `NEXT_PUBLIC_SITE_URL` points at the production URL
- [x] `NEXT_PUBLIC_APP_ENV=production` on Production

## Preview deployment smoke test

- [x] `/` loads with sample products and no console errors
- [x] Add a product by hand, then check it shows on `/` and on its detail page
- [x] **Draft from notes** fills the form; saving works; a missing price is flagged
- [x] Edit and delete a product
- [x] Settings: an invalid phone (`123`) shows an error; a valid one saves, and the shop name appears on `/`
- [x] `/assistant` streams a reply; **Stop** works
- [x] `/api/health` returns 200
- [x] Keyboard-only pass: skip link, nav, forms, and buttons are all reachable with visible focus

## Fail-safe checks

- [x] With the key removed (local `.env.local` without it), drafting shows the "fill in the form yourself" message and the manual form still saves
- [x] An unknown product URL (`/products/nope`) shows "Product not found"
- [x] An unknown route shows the 404 page (returns HTTP 404 on production)

## Quality gates

- [x] Lighthouse (mobile) on `/`: Performance 93 · Accessibility 100 · Best Practices 100 · SEO 100 (`/products/new` 92, `/settings` 97)
- [x] axe-core on `/`, `/products/new`, `/settings`: 0 violations, 21–24 rules passing per page (`docs/audits/axe-results.json`)

## Release

- [x] Merge to `main`, then Vercel creates the Production deployment (PRs #2, #3, #4)
- [x] Repeat the smoke test on the production URL (all pages 200, `/api/health` 200, `/api/draft-listing` returns a real draft)
- [x] Note the previous production deployment for rollback: `34300e8` → [https://backyard-vendor-ktxeieq94-keith20.vercel.app](https://backyard-vendor-ktxeieq94-keith20.vercel.app)

## Monitoring and rollback

- **Uptime:** `/api/health` (any external pinger, e.g. UptimeRobot free tier, every 5 min)
- **Errors:** Vercel → Project → Logs, filter for `[draft-listing]`
- **Rollback (fastest):** Vercel → Deployments → previous good deployment → **Promote to Production**
- **Rollback (code):** `git revert <sha>` → push to `main` → new production deploy
- **AI outage:** no rollback needed. The app keeps working and drafting shows the manual-entry fallback. Rotate or replace the key in Vercel env vars and redeploy.

