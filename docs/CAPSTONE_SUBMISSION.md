# Ship It capstone: Backyard Vendor

## Project brief

Backyard Vendor is a catalog app for people who sell from home: backyard gardeners, home
bakers, and market-stall vendors in Kenya who mostly sell to neighbours over the phone. They
know their products but rarely have a tidy list of what's available, at what price, and
whether it's sold out, and writing listings on a phone is slow. Vendors list products and shop
details; customers see one clean catalog with a number to call. The AI feature turns a one-line
note like _"chapati 50 bob each, soft, made fresh every morning"_ into a structured listing the
vendor reviews before saving. I chose it because it grew out of my Week 1 capstone idea and
solves a real friction point without turning into a marketplace.

## Links

- **Live app:** <https://backyard-vendor.vercel.app>
- **Repository:** <https://github.com/keithmetto/Backyard-Vendor>
- **README (setup, architecture, AI design, limitations):** [README.md](../README.md)

## AI integration

- `POST /api/draft-listing` calls Gemini through the Vercel AI SDK (`generateText` +
  `Output.object` with a zod schema), so the reply is a typed object, not free text.
- The prompt forbids guessing prices; `price` is nullable and missing details come back in
  `missingInfo`, shown as "Check before saving".
- The draft only pre-fills the form. Saving always goes through `validateProduct()`.
- Fallbacks: missing key (503), schema mismatch (502), timeout at 25 s (504), provider error
  (502, after two automatic retries), and a user **Cancel** button.
- Real output from the deployed prompt: _"chapati 50 bob each, soft, made fresh every morning,
  only 20 a day"_ → name "Soft Chapati", price 50, availability limited, no warnings.
  _"sukuma bundles from the garden, washed, big bunches"_ → price left empty with the warning
  "No price was mentioned." (no invented price). Every error message tells the vendor they can fill in
  the form themselves.
- Secondary: `/assistant` streaming chat (FE-06) for open-ended copy help.

## Testing evidence

- Command: `npm run test:coverage` (Vitest 3 + React Testing Library, v8 coverage)
- Result: **9 test files, 80 tests passed**; `npm run lint` clean; `npm run build` succeeds
- Coverage: **77.5% lines overall**, **70.6% lines in `components/`**, 98.3% in `lib/`,
  100% on `app/api/draft-listing/route.js`
- Components with tests: **14 of 17**: ProductForm, DraftFromNotes, SettingsForm, SettingsPanel,
  CatalogView, ProductCard, AvailabilityBadge, FormField, ProductManager, ProductDetail,
  ProductEditor, NavLinks (plus the pure modules they use). Untested: VendorChat (streaming
  chat from FE-06), SiteHeader, PlaceholderPanel.
- Screenshot: `docs/audits/test-coverage.png`

## Performance and accessibility audit

Lighthouse, mobile, on production (`https://backyard-vendor.vercel.app`). Reports are in `docs/audits/`.

| Page | Performance (before → after) | Accessibility | Best Practices | SEO |
|------|------------------------------|---------------|----------------|-----|
| `/` | 91 → 93 | 100 | 100 | 100 |
| `/products/new` | **89 → 92** | 100 | 100 | 100 |
| `/settings` | 99 → 97 | 100 | 100 | 100 |

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

> Draft. Rewrite it in your own words before submitting; reviewers want your honest take.

**What was hardest?** Making the AI trustworthy, not just impressive. My first mental model
was "ask the model for a listing"; in practice it will happily invent a price or a "500g jar"
that the vendor never mentioned, and a wrong price on a listing is worse than no listing. I
fixed that with a schema where `price` can be `null`, a prompt that forbids guessing, a
`missingInfo` field that feeds a "Check before saving" list, and a rule that the AI never
saves. The second hard part was `localStorage` in Next.js: reading it during render breaks
hydration, so I used `useSyncExternalStore` with a server snapshot that means "not loaded yet".

**What would I do differently?** Pick the data layer in week one. Choosing browser storage
kept the scope finishable, but it means a customer on another phone can't see the catalog,
which is the core promise of the app. I'd also write the end-to-end "draft → save → appears in
catalog" test before polishing the UI, not after.

**What surprised me?** The deployed AI broke without any code change: Google retired
`gemini-2.0-flash`, the model my FE-06 chat was pinned to, and `gemini-2.5-flash` was already
closed to new keys. The smoke test on the preview caught it because drafting returned
`ai_unavailable` while every page still worked, so the fallback did its job. I switched the
default to the `gemini-flash-latest` alias and added retries for free-tier "high demand" errors.
More broadly, I was surprised how much of "AI integration" is not the AI call. The `generateText`
call is about ten lines; the validation, error codes, cancel button, fallback copy, and tests
around it are most of the work, and they're what make the feature usable when the free-tier
quota runs out. The Week 2 lesson held: the precise prompts and rules in `CLAUDE.md` made AI
help faster to review, because every generated component had to pass the same testable rules.
