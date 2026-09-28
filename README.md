# Backyard Vendor

A small catalog app for backyard sellers, home bakers, and market-stall vendors.
A vendor lists what they sell, at what price, and whether it's still available;
customers get a clean catalog and a number to call. Writing listings is the slow
part, so the product form can **draft a listing from rough notes** with AI
(e.g. _"chapati 50 bob each, soft, made fresh every morning, only 20 a day"_).

- **Live app:** _add your Vercel production URL here_
- **Capstone write-up:** [`docs/CAPSTONE_SUBMISSION.md`](docs/CAPSTONE_SUBMISSION.md)
- **Deployment checklist:** [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)

## Features

| Route | What it does |
|-------|--------------|
| `/` | Customer catalog: shop name, order contact, product cards with price and availability |
| `/products` | Vendor view: list, edit, and delete products |
| `/products/new` | Add a product by hand or with **Draft from notes (AI)** |
| `/products/[id]` | Product detail with "call or text to order" |
| `/products/[id]/edit` | Edit a product (AI redraft available) |
| `/settings` | Shop name, Kenyan contact phone, optional email, currency, accepting orders, bio |
| `/assistant` | Streaming Listing Assistant chat for open-ended copy help |
| `/health`, `/api/health` | Health page and JSON probe for uptime checks |

Out of scope on purpose: payments, accounts, delivery, discovery filters. It is a catalog, not a marketplace.

## Run it locally (under 5 minutes)

Requires Node.js 22+ (the AI SDK needs it) and npm.

```bash
git clone https://github.com/keithmetto/Backyard-Vendor.git
cd Backyard-Vendor
cp .env.example .env.local   # then paste your Gemini key into .env.local
npm install && npm run dev
```

Open <http://localhost:3000>. Sample products appear on first load.

The app works **without** an API key: the catalog, product forms, and settings all run
in the browser. Only "Draft from notes" and `/assistant` need
`GOOGLE_GENERATIVE_AI_API_KEY` (free key from [Google AI Studio](https://aistudio.google.com/apikey)).
Without it, drafting shows "AI drafting isn't configured… fill in the form yourself".

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint (Next.js core-web-vitals rules) |
| `npm test` | Vitest unit + component tests |
| `npm run test:coverage` | Tests with a coverage report in `coverage/` |

## Architecture

```text
app/                         Next.js App Router
  page.js, products/, settings/   thin Server Component pages
  api/draft-listing/route.js      POST: notes → structured listing draft (Gemini)
  api/chat/route.js               POST: streaming Listing Assistant chat
  error.js, not-found.js          fail-safe screens
components/                  UI (Client Components only where there is interaction)
  ProductForm.js                  product create/edit form + AI draft panel
  DraftFromNotes.js               calls /api/draft-listing, handles loading/cancel/errors
  SettingsForm.js                 vendor settings form
  CatalogView.js, ProductCard.js, ProductDetail.js, ProductManager.js, ProductEditor.js
  FormField.js                    label + control + hint + error wiring (aria-invalid/aria-describedby)
lib/
  product-validation.js           pure product rules (no DOM)
  settings-validation.js          pure settings rules, incl. Kenyan phone format
  product-store.js, settings-store.js   pure parse/serialize/update helpers
  use-stored-value.js             localStorage hooks via useSyncExternalStore
  ai/listing-draft.js             zod schema, system prompt, draft → form mapping
  ai/listing-assistant.js         chat model + system prompt
tests/                       Vitest + React Testing Library
legacy/settings-drill/       Week 2 vague-vs-precise drill (archived)
```

**Data:** products live in `localStorage` under `backyard-vendor-products`, settings under
`backyard-vendor-settings`. Stored data is re-validated on read, so corrupt or outdated
entries are dropped instead of crashing the page. There is no backend database.

## How the AI fits in

**Problem it solves:** small vendors know their product but find writing a tidy listing
slow, especially on a phone. They can describe it in one line the way they'd tell a neighbour.

**Flow:** `DraftFromNotes` → `POST /api/draft-listing` → `generateText` with
`Output.object({ schema: listingDraftSchema })` (Vercel AI SDK v7, Google Gemini) →
`toProductFormValues()` → the product form is pre-filled → **the vendor reviews and saves**.

**Prompt design** ([`lib/ai/listing-draft.js`](lib/ai/listing-draft.js)):

- The system prompt says to use only facts in the notes and **never guess a price**. The schema
  makes `price` nullable, so "no price mentioned" is a valid answer and not an invented number.
- The model also returns `missingInfo` (e.g. "No price was mentioned."), shown as a
  "Check before saving" list.
- Vendor notes are fenced in `"""` and labelled as data, and the prompt says to ignore instructions
  inside them (basic prompt-injection hygiene).
- Temperature 0.3 keeps the output consistent. Slang like "50 bob" is converted to 50.

**Guardrails and fallbacks:**

| Situation | What happens |
|-----------|--------------|
| Notes too short/long | Blocked in the browser and on the server (400); no model call |
| No API key on the server | 503 `ai_not_configured`, and the form still works by hand |
| Model output doesn't match the schema | 502 `invalid_ai_output`, with a "Try again" button |
| Model takes more than 20 s | 504 `ai_timeout`; the vendor can also press **Cancel** at any time |
| Provider/quota error | 502 `ai_unavailable`, logged server-side |
| Draft breaks product rules (too long, no price) | Text is clamped, the price is left empty, and a warning is shown |

The AI never writes to storage. Every draft still goes through `validateProduct()` on save.

## Testing

```bash
npm test               # all tests
npm run test:coverage  # + coverage table and coverage/index.html
```

- **Pure logic:** product and settings validation, storage parsing, draft mapping, prompt rules.
- **API route:** `/api/draft-listing` with the model mocked: success, bad input, missing key,
  schema failure, timeout, provider error.
- **Components:** ProductForm, DraftFromNotes, SettingsForm, SettingsPanel, CatalogView,
  ProductManager, ProductDetail, ProductEditor, NavLinks. Tests check error association
  (`aria-invalid` + `aria-describedby`), focus on the first invalid field, AI failure fallbacks,
  cancel, and that an AI draft never saves by itself.

## Deploy and operate

Hosted on Vercel. Every push creates a Preview deployment, and `main` deploys to Production.

1. Vercel → Project → Settings → Environment Variables: set `GOOGLE_GENERATIVE_AI_API_KEY`
   (Preview + Production), `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_APP_ENV`.
2. Before merging, run through [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md).
3. **Monitoring:** `/api/health` for uptime checks; AI failures are logged as
   `[draft-listing] AI request failed` in Vercel → Logs.
4. **Rollback:** Vercel → Deployments → pick the last good production deployment →
   **Promote to Production** (instant). Or `git revert` the bad commit and push to `main`.

## Environment variables

See [`.env.example`](.env.example). Never commit `.env.local`.

- `GOOGLE_GENERATIVE_AI_API_KEY`: **server-only** Gemini key (never `NEXT_PUBLIC_`)
- `GOOGLE_GENERATIVE_MODEL`: optional model override (default `gemini-2.0-flash`)
- `NEXT_PUBLIC_SITE_URL`: public site URL
- `NEXT_PUBLIC_APP_ENV`: label on the health page

## Known limitations

- **Data is per browser.** Customers on another device don't see the vendor's products. A real
  launch needs a hosted database and vendor sign-in.
- No rate limiting on `/api/draft-listing`, so someone could burn the free Gemini quota.
- One currency per shop; prices are stored as plain numbers.
- AI drafts are only as good as the notes. Vendors must still read them before saving.

## Future improvements

1. Move products to a hosted database (e.g. Supabase) so the catalog is shareable by link.
2. Add per-IP rate limiting to the AI routes.
3. Let the Listing Assistant read the vendor's catalog to suggest improvements to existing listings.
4. Add a Playwright end-to-end test for "draft → review → save → appears in catalog".

## Project history

- Week 2 drill (vague vs precise prompting): branches `feat/settings-vague` / `feat/settings-precise`,
  notes in [`WORKFLOW.md`](WORKFLOW.md), code archived in `legacy/settings-drill/`.
- FE-06 streaming chat: `/assistant`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
