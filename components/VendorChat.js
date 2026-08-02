"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

const NEAR_BOTTOM_PX = 80;

function messageHasText(message) {
  return message.parts?.some(
    (part) => part.type === "text" && part.text.trim().length > 0,
  );
}

function getMessageText(message) {
  return (
    message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("") ?? ""
  );
}

/**
 * Streaming listing assistant UI (FE-06).
 *
 * - Thinking indicator until the first text token (handoff, not a hard swap)
 * - Stop mid-stream without losing the partial reply
 * - Auto-scroll only while the user is already near the bottom
 */
export default function VendorChat() {
  const [input, setInput] = useState("");
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const scrollerRef = useRef(null);
  const bottomRef = useRef(null);
  const transportRef = useRef(
    new DefaultChatTransport({ api: "/api/chat" }),
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: transportRef.current,
  });

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const waitingForFirstToken =
    status === "submitted" ||
    (status === "streaming" &&
      (!lastMessage ||
        lastMessage.role !== "assistant" ||
        !messageHasText(lastMessage)));

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distance =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      const nearBottom = distance <= NEAR_BOTTOM_PX;
      setPinnedToBottom(nearBottom);
      setShowJump(!nearBottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!pinnedToBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status, waitingForFirstToken, pinnedToBottom]);

  function jumpToLatest() {
    setPinnedToBottom(true);
    setShowJump(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;

    setPinnedToBottom(true);
    setShowJump(false);
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow)]">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="font-display text-lg font-semibold text-brand">
          Listing Assistant
        </h2>
        <p className="text-sm text-muted">
          Draft titles, descriptions, and pricing language. Responses stream live.
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollerRef}
          className="h-full space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 ? (
            <div className="rounded-lg bg-accent-soft/60 px-4 py-3 text-sm text-muted">
              <p className="font-medium text-foreground">Try asking:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Write a short listing for homemade chapati, KES 50 each.</li>
                <li>Improve this title: “nice plants for sale”.</li>
                <li>What should I include in a description for fresh eggs?</li>
              </ul>
            </div>
          ) : null}

          {messages.map((message) => {
            const isUser = message.role === "user";
            const text = getMessageText(message);
            // Hide empty assistant shells; the thinking row occupies that slot
            // until the first token arrives (indicator → text handoff).
            if (!isUser && !text) return null;

            return (
              <article
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 sm:max-w-[80%] ${
                    isUser
                      ? "bg-brand text-white"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  <p
                    className={`mb-1 text-xs font-semibold uppercase tracking-wide ${
                      isUser ? "text-white/80" : "text-muted"
                    }`}
                  >
                    {isUser ? "You" : "Assistant"}
                  </p>
                  {/* Plain text avoids broken half-streamed markdown. */}
                  <p className="whitespace-pre-wrap break-words">{text}</p>
                </div>
              </article>
            );
          })}

          {waitingForFirstToken ? (
            <div
              className="flex justify-start"
              aria-label="Assistant is thinking"
            >
              <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm text-muted">
                <span className="thinking-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Thinking…
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {showJump ? (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-brand shadow-sm transition hover:border-brand"
          >
            Jump to latest
          </button>
        ) : null}
      </div>

      {error ? (
        <div
          className="border-t border-border bg-accent-soft px-4 py-2 text-sm text-danger"
          role="alert"
        >
          Something went wrong.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => regenerate()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:items-end sm:p-4"
      >
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <textarea
          id="chat-input"
          rows={2}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          placeholder="Ask for a listing title, description, or price wording…"
          disabled={isBusy || error != null}
          className="min-h-[2.75rem] w-full flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-brand focus:ring-2 disabled:opacity-60"
        />
        <div className="flex gap-2 sm:shrink-0">
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="flex-1 rounded-xl border border-danger bg-surface px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-accent-soft sm:flex-none"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || error != null}
              className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
