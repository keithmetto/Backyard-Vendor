"use client";

import { useRef, useState } from "react";
import { NOTES_LIMITS, validateNotes } from "@/lib/notes-validation";
import { inputClass } from "@/components/FormField";

const FALLBACK_MESSAGE =
  "Couldn't reach the AI drafting service. Try again or fill in the form yourself.";

/**
 * Sends rough notes to /api/draft-listing and hands the structured draft to
 * the parent form. Never saves anything itself.
 */
export default function DraftFromNotes({ currency = "KES", onDraft }) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [notesError, setNotesError] = useState(null);
  const controllerRef = useRef(null);

  async function requestDraft(event) {
    event.preventDefault();
    const error = validateNotes(notes);
    setNotesError(error);
    if (error) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("loading");
    setMessage("Drafting your listing…");

    try {
      const response = await fetch("/api/draft-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, currency }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.values) {
        setStatus("error");
        setMessage(data?.error?.message ?? FALLBACK_MESSAGE);
        return;
      }

      onDraft(data.values, data.warnings ?? []);
      setStatus("success");
      setMessage("Draft added to the form below. Review it before saving.");
    } catch (err) {
      if (err?.name === "AbortError") {
        setStatus("idle");
        setMessage("Drafting cancelled.");
        return;
      }
      setStatus("error");
      setMessage(FALLBACK_MESSAGE);
    } finally {
      controllerRef.current = null;
    }
  }

  const isLoading = status === "loading";

  return (
    <section
      aria-labelledby="draft-heading"
      className="rounded-[var(--radius)] border border-border bg-accent-soft/50 p-4 sm:p-5"
    >
      <h2 id="draft-heading" className="font-display text-lg font-semibold text-brand">
        Draft from notes (AI)
      </h2>
      <p className="mt-1 text-sm text-muted">
        Jot down what you sell the way you&apos;d tell a neighbour. The AI fills
        in the form; nothing is saved until you press Save.
      </p>

      <form onSubmit={requestDraft} className="mt-3 space-y-2" noValidate>
        <label htmlFor="draft-notes" className="block text-sm font-semibold text-foreground">
          Your notes
        </label>
        <textarea
          id="draft-notes"
          rows={3}
          value={notes}
          maxLength={NOTES_LIMITS.max}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. chapati 50 bob each, soft, made fresh every morning, only 20 a day"
          aria-invalid={notesError ? "true" : undefined}
          aria-describedby={notesError ? "draft-notes-error" : "draft-notes-count"}
          className={inputClass}
          disabled={isLoading}
        />
        <p id="draft-notes-count" className="text-xs text-muted">
          {notes.trim().length}/{NOTES_LIMITS.max} characters
        </p>
        {notesError ? (
          <p id="draft-notes-error" className="text-sm font-medium text-danger">
            {notesError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Drafting…" : status === "error" ? "Try again" : "Draft listing"}
          </button>
          {isLoading ? (
            <button
              type="button"
              onClick={() => controllerRef.current?.abort()}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-foreground">
        {status === "error" ? "" : message}
      </p>
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {message}
        </p>
      ) : null}
    </section>
  );
}
