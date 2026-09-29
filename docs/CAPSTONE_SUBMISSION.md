# Ship It capstone: Backyard Vendor

## Project brief

Backyard Vendor is a catalog app for people who sell from home: backyard gardeners, home
bakers, and market-stall vendors in Kenya who mostly sell to neighbours over the phone. They
know their products but rarely have a tidy list of what's available, at what price, and
whether it's sold out, and writing listings on a phone is slow. Vendors list products and shop
details; customers see one clean catalog with a number to call. The AI feature turns a one-line
note like *"chapati 50 bob each, soft, made fresh every morning"* into a structured listing the
vendor reviews before saving. I chose it because it grew out of my Week 1 capstone idea and
solves a real friction point without turning into a marketplace.

## Links

- **Live app:** [https://backyard-vendor.vercel.app](https://backyard-vendor.vercel.app)
- **Repository:** [https://github.com/keithmetto/Backyard-Vendor](https://github.com/keithmetto/Backyard-Vendor)
- **README (setup, architecture, AI design, limitations):** [README.md](../README.md)



## AI integration

- `POST /api/draft-listing` calls Gemini through the Vercel AI SDK (`generateText` +
`Output.object` with a zod schema), so the reply is a typed object, not free text.
- The prompt forbids guessing prices; `price` is nullable and missing details come back in
`missingInfo`, shown as "Check before saving".
- The draft only pre-fills the form. Saving always goes through `validateProduct()`.
- Fallbacks: missing key (503), schema mismatch (502), timeout at 25 s (504), provider error
(502, after two automatic retries), and a user **Cancel** button.
- Real output from the deployed prompt: *"chapati 50 bob each, soft, made fresh every morning,
only 20 a day"* → name "Soft Chapati", price 50, availability limited, no warnings.
*"sukuma bundles from the garden, washed, big bunches"* → price left empty with the warning
"No price was mentioned." (no invented price). Every error message tells the vendor they can fill in
the form themselves.
- Secondary: `/assistant` streaming chat (FE-06) for open-ended copy help.



## Testing evidence

- Command: `npm run test:coverage` (Vitest 3 + React Testing Library, v8 coverage)
- Result: **9 test files, 80 tests passed**; `npm run lint` clean; `npm run build` succeeds
- Coverage: **77.5% lines overall**, **70.6% lines in** `components/`, 98.3% in `lib/`,
100% on `app/api/draft-listing/route.js`
- Components with tests: **14 of 17**: ProductForm, DraftFromNotes, SettingsForm, SettingsPanel,
CatalogView, ProductCard, AvailabilityBadge, FormField, ProductManager, ProductDetail,
ProductEditor, NavLinks (plus the pure modules they use). Untested: VendorChat (streaming
chat from FE-06), SiteHeader, PlaceholderPanel.
- Screenshot: `docs/audits/test-coverage.png`



## Performance and accessibility audit

Lighthouse, mobile, on production (`https://backyard-vendor.vercel.app`). Reports are in `docs/audits/`.


| Page            | Performance (before → after) | Accessibility | Best Practices | SEO |
| --------------- | ---------------------------- | ------------- | -------------- | --- |
| `/`             | 91 → 93                      | 100           | 100            | 100 |
| `/products/new` | **89 → 92**                  | 100           | 100            | 100 |
| `/settings`     | 99 → 97                      | 100           | 100            | 100 |


Performance varies by a few points between runs (network and CPU throttling), so the `/` and
`/settings` changes are noise; `/products/new` is the page the fix targeted.

**axe-core 4.12** (WCAG 2.0/2.1 A + AA rules) on production: **0 violations** on `/`,
`/products/new`, and `/settings`, with 21, 24, and 24 rules passing
(`docs/audits/axe-results.json`). axe flagged the header nav links for manual contrast
review because they sat on a translucent header over a background gradient; checked by hand
(muted `#5c6d62` on near-white is about 5.4:1, above the 4.5:1 AA minimum).

**Improvement made from the audit:** Lighthouse flagged ~205 KiB of unused JavaScript on
`/products/new`. The cause was an import: `DraftFromNotes` imported `validateNotes` from
`lib/ai/listing-draft.js`, which also imports **zod** to build the AI schema, so zod and its
JSON-schema converter shipped to the browser. I moved the notes rules into a zod-free
`lib/notes-validation.js` ([PR #3](https://github.com/keithmetto/Backyard-Vendor/pull/3)).
Result: page JavaScript **909 KB → 632 KB (−277 KB, −30%)**, unused JS 205 → 104 KiB,
Performance 89 → 92. zod now only loads on `/assistant`, where the chat SDK needs it.

**Audit mistake I caught:** my first axe CLI run reported "0 violations" on every page, but
PowerShell had split the `--tags` list into one invalid tag, so **zero rules actually ran**.
Checking the saved JSON (0 passes, 0 inapplicable) exposed it; the rerun above ran 21–24 rules
per page. "No violations" is only meaningful next to a non-zero pass count.

Accessibility built in from the start: skip link, `aria-current` on nav, every control
labelled, invalid fields set `aria-invalid` + `aria-describedby` to a visible `{id}-error`,
focus moves to the first invalid field, `aria-live` status for saves and AI progress,
`role="alert"` for failures, sold-out prices announced to screen readers, and reduced-motion support.

## Deployment and operation

- Checklist: [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) (filled in and signed off)
- **Fails safely:** without AI the app still works (manual form); corrupt stored data is
dropped on read; unknown products show "Product not found"; route errors show `app/error.js`
with "Try again"; storage write failures show an alert and keep the form contents.
- **Monitoring:** `/api/health` uptime probe and Vercel logs (`[draft-listing]`).
- **Rollback:** promote the previous Vercel deployment, or `git revert` and push to `main`.



## Reflection

The hardest part wasn't getting AI to generate a listing — it was getting it to stop inventing one. Left alone, the model will confidently fill in a price or a size the vendor never mentioned, and for a catalog app, a wrong price is worse than a missing one. I designed around that instead of trusting it away: `price` is nullable, the prompt is told never to guess, and a `missingInfo` field surfaces anything unclear as a "check before saving" list — the model never gets to save anything directly, a human always does. `localStorage` in Next.js caused its own fight, since reading it during render quietly breaks hydration; `useSyncExternalStore` with a server snapshot meaning "not loaded yet" fixed it, but only after I understood why the naive version failed. And production found two problems I didn't put there myself: Google retired `gemini-2.0-flash`, the exact model I'd pinned FE-06 to, mid-project, with no code change on my end — caught by the smoke test when drafting started returning `ai_unavailable` while the rest of the app kept working, exactly as the fallback was supposed to do. Separately, the Lighthouse audit flagged 205 KiB of unused JS on `/products/new`, traced back to `DraftFromNotes` importing `validateNotes` from a file that also pulled in `zod` for the AI schema — so `zod` was shipping to every visitor's browser whether or not they touched the AI feature. Splitting the notes-validation logic into its own zod-free file cut that page's JavaScript by 277 KB (30%) and pushed Performance from 89 to 92.

If I did it again, I'd pick the real data layer in week one instead of defaulting to browser storage for speed — it got me to a finishable demo, but it means a customer on a different phone can't see the same catalog, which quietly undercuts the whole point of the app. I'd also write the full "draft → save → appears in catalog" test before polishing any UI, since that's the path that actually has to hold. What surprised me most, though, is how little of "AI integration" is actually the AI call — `generateText` is maybe ten lines: the validation, error states, retries, fallback copy, and tests around it are most of the real work, and they're what kept the app usable when a model got retired and a free-tier quota ran thin. The rules I wrote into `CLAUDE.md` in week two kept paying for themselves here too — having testable, specific constraints meant every AI-touched piece could be checked against the same bar instead of a fresh judgment call each time.

