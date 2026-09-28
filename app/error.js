"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-xl rounded-[var(--radius)] border border-danger/30 bg-surface p-6 sm:p-8"
    >
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Something went wrong on this page
      </h1>
      <p className="mt-3 text-muted">
        Your saved products and settings are still in this browser. Try again,
        or go back to the catalog.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-brand">
          Back to catalog
        </Link>
      </div>
    </section>
  );
}
