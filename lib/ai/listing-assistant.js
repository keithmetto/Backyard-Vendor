/**
 * Listing Assistant — model + system prompt config (FE-06 / FE-07)
 *
 * Keep provider, model id, temperature, and system instructions here so the
 * route handler stays thin. FE-07 will extend this module (tools, structured
 * output) without rewriting the chat UI.
 *
 * Provider choice: Google Gemini via `@ai-sdk/google` (free-tier friendly).
 * The assignment mentions Claude; Q&A allows any model resource. Swap the
 * provider import in `app/api/chat/route.js` if you later use Anthropic —
 * leave this file's shape (model id, systemPrompt, temperature) the same.
 *
 * Env: `GOOGLE_GENERATIVE_AI_API_KEY` (server-only; never NEXT_PUBLIC_*).
 */

/** @typedef {{ model: string, temperature: number, systemPrompt: string }} ListingAssistantConfig */

/** @type {ListingAssistantConfig} */
export const listingAssistantConfig = {
  // Alias that follows Google's current Flash model; pinned ids such as
  // gemini-2.0-flash have been retired. Pin one via env for reproducible output.
  model: process.env.GOOGLE_GENERATIVE_MODEL || "gemini-flash-latest",

  // Slight creativity for listing copy; keep low enough for consistent advice.
  temperature: 0.6,

  systemPrompt: [
    "You are the Listing Assistant for Backyard Vendor, a small-shop catalog tool",
    "for local vendors (not a full marketplace).",
    "",
    "Help vendors draft clear product titles, short descriptions, and sensible",
    "pricing language for yard sales, home bakers, craft stalls, and similar shops.",
    "",
    "Guidelines:",
    "- Prefer plain language a neighborhood customer would understand.",
    "- Ask one clarifying question when the product or price is too vague.",
    "- Keep replies concise unless the vendor asks for longer copy.",
    "- Do not invent payments, verification badges, discovery filters, or other",
    "  marketplace features that are outside this catalog-first app.",
    "- If asked for something unrelated, briefly redirect to listing help.",
  ].join("\n"),
};
