# Deployment checklist: Backyard Vendor

Fill this in for each production release. Tick an item only after you have checked it.

**Release:** capstone v1.0 · **Date:** ____ · **Commit:** ____ · **Signed off by:** Keith Metto

## Before merge

- [x] `npm run lint` passes
- [x] `npm test` passes (80 tests passed, 9 files)
- [x] `npm run build` succeeds locally
- [ ] No secrets in the diff (`.env.local` is git-ignored; the key only lives in Vercel env vars)
- [ ] README setup steps still match reality (fresh clone → `npm install && npm run dev`)

## Environment

- [x] `GOOGLE_GENERATIVE_AI_API_KEY` set in Vercel for **Preview** and **Production** (verified: `/api/draft-listing` returns 200 on both)
- [ ] `NEXT_PUBLIC_SITE_URL` points at the production URL
- [ ] `NEXT_PUBLIC_APP_ENV=production` on Production

## Preview deployment smoke test

- [ ] `/` loads with sample products and no console errors
- [ ] Add a product by hand, then check it shows on `/` and on its detail page
- [ ] **Draft from notes** fills the form; saving works; a missing price is flagged
- [ ] Edit and delete a product
- [ ] Settings: an invalid phone (`123`) shows an error; a valid one saves, and the shop name appears on `/`
- [ ] `/assistant` streams a reply; **Stop** works
- [x] `/api/health` returns 200
- [ ] Keyboard-only pass: skip link, nav, forms, and buttons are all reachable with visible focus

## Fail-safe checks

- [ ] With the key removed (local `.env.local` without it), drafting shows the "fill in the form yourself" message and the manual form still saves
- [ ] An unknown product URL (`/products/nope`) shows "Product not found"
- [ ] An unknown route shows the 404 page

## Quality gates

- [x] Lighthouse (mobile) on `/`: Performance 93 · Accessibility 100 · Best Practices 100 · SEO 100 (`/products/new` 92, `/settings` 97)
- [x] axe-core on `/`, `/products/new`, `/settings`: 0 violations, 21–24 rules passing per page (`docs/audits/axe-results.json`)

## Release

- [ ] Merge to `main`, then Vercel creates the Production deployment
- [ ] Repeat the smoke test on the production URL
- [ ] Note the previous production deployment ID for rollback: ____

## Monitoring and rollback

- **Uptime:** `/api/health` (any external pinger, e.g. UptimeRobot free tier, every 5 min)
- **Errors:** Vercel → Project → Logs, filter for `[draft-listing]`
- **Rollback (fastest):** Vercel → Deployments → previous good deployment → **Promote to Production**
- **Rollback (code):** `git revert <sha>` → push to `main` → new production deploy
- **AI outage:** no rollback needed. The app keeps working and drafting shows the manual-entry fallback. Rotate or replace the key in Vercel env vars and redeploy.
