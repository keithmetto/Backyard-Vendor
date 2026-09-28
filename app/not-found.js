import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-[var(--radius)] border border-border bg-surface p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-3 text-muted">That page doesn&apos;t exist.</p>
      <Link href="/" className="mt-4 inline-block font-semibold text-brand underline underline-offset-2">
        Back to catalog
      </Link>
    </section>
  );
}
