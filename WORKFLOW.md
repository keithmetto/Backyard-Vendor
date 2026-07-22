# Workflow comparison: vague vs precise prompting

This note compares two implementations of a Backyard Vendor settings form.

- Round 1 branch: `feat/settings-vague` — one-sentence prompt: “Make me a settings form.”
- Round 2 branch: `feat/settings-precise` — file paths, constraints, example behaviors, Plan mode, then “write tests and run them.”

## Correctness

Round 1 shipped a polished UI fast, but the model filled gaps with product fiction: M-PESA labels, “Kadogo” filters, estate picklists, and a “Jua Kali Verified” ID upload. None of that was requested. Validation lived inside a DOM IIFE (`js/settings.js`), so there was no way to prove edge cases without clicking through the browser. Storage used the key `bv-settings`.

Round 2 stayed on the specified fields (`shopName`, Kenyan phone, optional email, currency, accepting orders, bio). Validation is a pure module (`js/settings-validation.js`) with `npm test` (`node --test`) covering empty submit, a valid “Amina Yard” save path, `phone: "123"`, and invalid email. Persistence uses the agreed key `backyard-vendor-settings`. README documents `npm start` and `npm test`.

**AI mistake caught in Round 1:** the vague run treated “settings form” as permission to invent marketplace features. That looks impressive until you review for scope — then most of the page is wrong for a catalog-first capstone.

## Accessibility

Round 1 had labels, `role="alert"` on static error text, and an `aria-live` toast, but invalid controls never got `aria-invalid` or `aria-describedby`, so screen readers were not reliably tied to field errors.

Round 2 wires each error id (`shopName-error`, etc.), sets `aria-invalid` / `aria-describedby` on failure, focuses the first invalid control, and announces “Settings saved” on an `aria-live` status region.

## Edge cases and review effort

Round 1’s phone regex was looser (`(?:\+?254|0)?7\d{8}`) and CSS ballooned (~465 lines in `css/style.css`) around extras (upload drag-and-drop, toggles). Review meant hunting scope creep and guessing behavior.

Round 2 CSS is smaller (`css/settings.css`, ~130 lines) and tests encode the contract. Wall-clock: Round 1 felt faster to generate; Round 2 felt slower while planning. End-to-end — including review and confidence that empty, bad phone, and bad email fail — Round 2 was cheaper. That is the lesson for FE-06 onward: specs and a verification loop beat accepting a pretty first draft.
