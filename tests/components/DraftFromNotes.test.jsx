import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DraftFromNotes from "@/components/DraftFromNotes";

function jsonResponse(status, body) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

const NOTES = "eggs 450 a tray, free range, few left";

describe("DraftFromNotes", () => {
  it("validates notes locally before calling the API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<DraftFromNotes onDraft={vi.fn()} />);

    await user.type(screen.getByLabelText("Your notes"), "eggs");
    await user.click(screen.getByRole("button", { name: "Draft listing" }));

    const notes = screen.getByLabelText("Your notes");
    expect(notes).toHaveAttribute("aria-invalid", "true");
    expect(notes).toHaveAccessibleDescription(/at least 8 characters/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts notes with the shop currency and hands back the draft", async () => {
    const user = userEvent.setup();
    const onDraft = vi.fn();
    const fetchMock = vi.fn(() =>
      jsonResponse(200, {
        values: { name: "Farm eggs", description: "", price: "450", availability: "limited" },
        warnings: [],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<DraftFromNotes currency="USD" onDraft={onDraft} />);

    await user.type(screen.getByLabelText("Your notes"), NOTES);
    await user.click(screen.getByRole("button", { name: "Draft listing" }));

    expect(await screen.findByText(/Review it before saving/)).toBeInTheDocument();
    expect(onDraft).toHaveBeenCalledWith(
      { name: "Farm eggs", description: "", price: "450", availability: "limited" },
      [],
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/draft-listing");
    expect(JSON.parse(init.body)).toEqual({ notes: NOTES, currency: "USD" });
  });

  it("shows the server's fallback message and offers a retry when AI fails", async () => {
    const user = userEvent.setup();
    const onDraft = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse(503, {
          error: {
            code: "ai_not_configured",
            message: "AI drafting isn't configured on this deployment. You can still fill in the form yourself.",
          },
        }),
      ),
    );
    render(<DraftFromNotes onDraft={onDraft} />);

    await user.type(screen.getByLabelText("Your notes"), NOTES);
    await user.click(screen.getByRole("button", { name: "Draft listing" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/fill in the form yourself/);
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
    expect(onDraft).not.toHaveBeenCalled();
  });

  it("shows a generic fallback when the network fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
    render(<DraftFromNotes onDraft={vi.fn()} />);

    await user.type(screen.getByLabelText("Your notes"), NOTES);
    await user.click(screen.getByRole("button", { name: "Draft listing" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Couldn't reach/);
  });

  it("can cancel a slow request", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          }),
      ),
    );
    render(<DraftFromNotes onDraft={vi.fn()} />);

    await user.type(screen.getByLabelText("Your notes"), NOTES);
    await user.click(screen.getByRole("button", { name: "Draft listing" }));
    expect(screen.getByRole("button", { name: "Drafting…" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Drafting cancelled.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draft listing" })).toBeEnabled();
  });
});
