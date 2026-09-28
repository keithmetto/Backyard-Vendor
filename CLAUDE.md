# AI Development Guide

## Project Context

Backyard Vendor is a Next.js capstone for an internship program. It helps small local vendors manage and present basic product listings — not a full marketplace.

## Stack

- Runtime: Node.js LTS
- Framework: Next.js (App Router), React
- Language: JavaScript
- Styling: Tailwind CSS v4 with tokens in `app/globals.css`
- Package manager: npm
- Hosting: Vercel (preview deployments on push)
- IDE: Cursor
- Version control: Git and GitHub

## Conventions

- Use Conventional Commits for every commit.
- Keep documentation current when setup or usage changes.
- Prefer clear, small changes that are easy to review.
- Do not commit secrets, `.env` / `.env.local` files, generated build output (`.next`), or `node_modules`.
- Default to Server Components; use Client Components only for interactivity.
- Scaffold routes and placeholders before polishing UI.

## Project rules (learned from FE foundations drill)

These rules are testable in review. Prefer failing a PR over “clean code” vibes.

1. **Form validation is pure and tested.** Put rules in `lib/*-validation.js` with no DOM access. Cover them with `npm test` (Vitest). Do not bury validation only inside UI event handlers.
2. **Vendor settings persistence key is fixed.** Client settings use `localStorage` key `backyard-vendor-settings` only. Do not invent alternate keys (e.g. `bv-settings`) without an explicit migration note in the README.
3. **Invalid fields must be programmatically associated.** On validation failure, set `aria-invalid="true"` and `aria-describedby` on the control pointing at a visible error element (`{id}-error`). Labels alone or decorative `role="alert"` text are not enough.
4. **Kenyan mobile format for contact phone.** Accept only `07XXXXXXXX` or `+2547XXXXXXXX` (after trim). Reject other shapes in validation tests.
5. **No unrequested product scope.** Do not add marketplace concepts (payments UI, verification uploads, discovery filters, fictional badges) unless the prompt or issue lists them. Settings work stays limited to the agreed fields.

## AI Assistant Expectations

- Critique README changes for clarity and completeness.
- Suggest improvements that make the project easier for a new reviewer to understand.
- Keep generated code and documentation aligned with the stack above.
- When implementing forms, follow the project rules above before polishing visuals.
