// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoObjectGeneratedError } from "ai";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, generateText };
});

vi.mock("@ai-sdk/google", () => ({
  google: (modelId) => ({ modelId }),
}));

import { POST } from "@/app/api/draft-listing/route";

function request(body) {
  return new Request("http://localhost/api/draft-listing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const NOTES = "chapati 50 bob each, soft, made fresh every morning";

describe("POST /api/draft-listing", () => {
  beforeEach(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    generateText.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  });

  it("returns form values from a structured draft", async () => {
    generateText.mockResolvedValue({
      output: {
        name: "Fresh chapati",
        description: "Soft chapati made fresh every morning.",
        price: 50,
        availability: "in_stock",
        missingInfo: [],
      },
    });

    const response = await POST(request({ notes: NOTES, currency: "KES" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.values).toEqual({
      name: "Fresh chapati",
      description: "Soft chapati made fresh every morning.",
      price: "50",
      availability: "in_stock",
    });
    expect(data.warnings).toEqual([]);

    const call = generateText.mock.calls[0][0];
    expect(call.prompt).toContain(NOTES);
    expect(call.output).toBeDefined();
    expect(call.system).toMatch(/never guess a price/i);
  });

  it("rejects malformed JSON and too-short notes without calling the model", async () => {
    expect((await POST(request("{nope"))).status).toBe(400);

    const response = await POST(request({ notes: "eggs" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_notes");
    expect(generateText).not.toHaveBeenCalled();
  });

  it("returns 503 with a manual-entry message when the key is missing", async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const response = await POST(request({ notes: NOTES }));
    const data = await response.json();
    expect(response.status).toBe(503);
    expect(data.error.code).toBe("ai_not_configured");
    expect(data.error.message).toMatch(/fill in the form yourself/);
  });

  it("maps schema failures to invalid_ai_output", async () => {
    generateText.mockRejectedValue(
      new NoObjectGeneratedError({
        message: "No object generated: response did not match schema.",
        text: "{}",
        response: { id: "r1", timestamp: new Date(), modelId: "test" },
        usage: {},
        finishReason: "stop",
      }),
    );
    const response = await POST(request({ notes: NOTES }));
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("invalid_ai_output");
  });

  it("maps timeouts to 504", async () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    generateText.mockRejectedValue(timeout);
    const response = await POST(request({ notes: NOTES }));
    expect(response.status).toBe(504);
  });

  it("maps provider errors to ai_unavailable", async () => {
    generateText.mockRejectedValue(new Error("quota exceeded"));
    const response = await POST(request({ notes: NOTES }));
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("ai_unavailable");
  });
});
