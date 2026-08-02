# Backyard Vendor

Capstone app for small local vendors: present products, manage basic listings, and prepare for customer orders.

## Tech stack

- Next.js (App Router) + React
- JavaScript
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- npm
- Deploy target: Vercel (preview on every push)

## Capstone screens (scaffold)

Every screen from the current spec exists as a routed placeholder:

| Route | Purpose |
|-------|---------|
| `/` | Catalog home |
| `/products` | Product list |
| `/products/[id]` | Product detail |
| `/assistant` | Streaming Listing Assistant chat (FE-06) |
| `/settings` | Vendor settings (form comes later) |
| `/about` | About |
| `/health` | Health check that **fetches** and renders live JSON |
| `/api/health` | JSON health probe for uptime checks |
| `/api/chat` | Streaming chat route handler (`streamText`) |

### FE-06 reviewer links

- **Preview URL:** open `/assistant` on the Vercel deployment (hold a live streaming conversation there).
- **Route handler:** [`app/api/chat/route.js`](app/api/chat/route.js)
- **Chat component:** [`components/VendorChat.js`](components/VendorChat.js)
- **Model + system prompt:** [`lib/ai/listing-assistant.js`](lib/ai/listing-assistant.js)

Uses the Vercel AI SDK (`streamText` + `useChat`). Model is Google Gemini (free-tier friendly; assignment Q&A allows non-Claude providers). The API key is server-only.

## Getting started

1. Install Node.js LTS and Git.
2. Clone this repository.
3. Copy env template and install dependencies:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Local Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Legacy Week 2 validation tests (`legacy/settings-drill`) |

## Environment variables

See [`.env.example`](.env.example). No secrets belong in the repo.

- `NEXT_PUBLIC_SITE_URL` — public site URL (local or Vercel preview)
- `NEXT_PUBLIC_APP_ENV` — label shown on the health page (`development` / `preview` / `production`)
- `GOOGLE_GENERATIVE_AI_API_KEY` — **server-only** Gemini key for `/api/chat` ([AI Studio](https://aistudio.google.com/apikey))
- `GOOGLE_GENERATIVE_MODEL` — optional model override (default `gemini-2.0-flash`)

Use Vercel Project Settings → Environment Variables for preview and production values. Keep `.env.local` on your machine only. Add the Gemini key there before reviewing the streaming chat on a preview deployment.

## Deploy to Vercel (preview on every push)

1. Push this branch to GitHub (`keithmetto/Backyard-Vendor`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Next.js** (auto-detected). Leave build settings default.
4. Add env vars from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to the Vercel URL after the first deploy if needed).
5. Confirm each push creates a **Preview** deployment.

Submit the assignment with the **preview URL** + this repo link.

## Week 2 foundations drill

The vague-vs-precise settings form comparison lives on branches `feat/settings-vague` / `feat/settings-precise`, with a copy archived under `legacy/settings-drill/` and notes in `WORKFLOW.md`.

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
