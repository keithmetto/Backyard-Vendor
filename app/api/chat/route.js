import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { google } from "@ai-sdk/google";
import { listingAssistantConfig } from "@/lib/ai/listing-assistant";

/** Allow long streaming replies on serverless hosts (e.g. Vercel). */
export const maxDuration = 30;

/**
 * POST /api/chat
 *
 * Streams assistant tokens with the AI SDK UI message protocol so `useChat`
 * can render typed message parts. The API key stays server-side via
 * `GOOGLE_GENERATIVE_AI_API_KEY`.
 */
export async function POST(req) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      {
        error:
          "Missing GOOGLE_GENERATIVE_AI_API_KEY. Add it to .env.local (local) or Vercel env vars (preview).",
      },
      { status: 500 },
    );
  }

  const { messages } = await req.json();

  const result = streamText({
    model: google(listingAssistantConfig.model),
    system: listingAssistantConfig.systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: listingAssistantConfig.temperature,
    // Propagate client abort so Stop cancels provider work, not only the UI.
    abortSignal: req.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
