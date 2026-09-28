import {
  generateText,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  Output,
} from "ai";
import { google } from "@ai-sdk/google";
import { listingAssistantConfig } from "@/lib/ai/listing-assistant";
import {
  buildDraftPrompt,
  listingDraftSchema,
  listingDraftSystemPrompt,
  toProductFormValues,
  validateNotes,
} from "@/lib/ai/listing-draft";

export const maxDuration = 30;

const DRAFT_TIMEOUT_MS = 25_000;

function errorResponse(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}

/**
 * POST /api/draft-listing  { notes: string, currency?: "KES" | "USD" }
 *
 * 200 → { values, warnings }        draft to pre-fill the product form
 * 4xx/5xx → { error: { code, message } }  the form stays usable by hand
 */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "invalid_json", "Send JSON with a notes field.");
  }

  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const notesError = validateNotes(notes);
  if (notesError) {
    return errorResponse(400, "invalid_notes", notesError);
  }
  const currency = body?.currency === "USD" ? "USD" : "KES";

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return errorResponse(
      503,
      "ai_not_configured",
      "AI drafting isn't configured on this deployment. You can still fill in the form yourself.",
    );
  }

  try {
    const result = await generateText({
      model: google(listingAssistantConfig.model),
      system: listingDraftSystemPrompt,
      prompt: buildDraftPrompt(notes, currency),
      output: Output.object({ schema: listingDraftSchema, name: "listing_draft" }),
      temperature: 0.3,
      // Free-tier Gemini returns transient 503 "high demand" errors.
      maxRetries: 2,
      timeout: DRAFT_TIMEOUT_MS,
      abortSignal: req.signal,
    });

    return Response.json(toProductFormValues(result.output));
  } catch (error) {
    if (
      NoObjectGeneratedError.isInstance(error) ||
      NoOutputGeneratedError.isInstance(error)
    ) {
      return errorResponse(
        502,
        "invalid_ai_output",
        "The AI reply didn't match the listing format. Try again or fill in the form yourself.",
      );
    }
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return errorResponse(
        504,
        "ai_timeout",
        "The AI took too long to answer. Try again or fill in the form yourself.",
      );
    }
    console.error("[draft-listing] AI request failed", error);
    return errorResponse(
      502,
      "ai_unavailable",
      "The AI service is unavailable right now. Try again or fill in the form yourself.",
    );
  }
}
