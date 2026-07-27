import Link from "next/link";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export const metadata = {
  title: "Catalog",
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      <PlaceholderPanel
        title="Vendor catalog"
        note="Placeholder screen — product cards will land here in a later milestone."
      >
        <p>
          Browse what is currently offered from a small local vendor: names,
          descriptions, prices, and availability.
        </p>
        <p className="mt-3">
          This home route is the customer-facing catalog shell for the
          Backyard Vendor capstone.
        </p>
      </PlaceholderPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/products"
          className="rounded-[var(--radius)] border border-border bg-accent-soft px-5 py-4 transition hover:border-brand"
        >
          <h2 className="font-display text-xl font-semibold text-brand">Products</h2>
          <p className="mt-1 text-sm text-muted">Listing placeholders for every product screen.</p>
        </Link>
        <Link
          href="/settings"
          className="rounded-[var(--radius)] border border-border bg-surface px-5 py-4 transition hover:border-brand"
        >
          <h2 className="font-display text-xl font-semibold text-brand">Settings</h2>
          <p className="mt-1 text-sm text-muted">Vendor profile and shop preferences (coming next).</p>
        </Link>
      </div>
    </div>
  );
}
