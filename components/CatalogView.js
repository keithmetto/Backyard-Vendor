"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useProducts, useSettings } from "@/lib/use-stored-value";

export function CatalogContent({ products, settings, ready }) {
  const shopName = settings.shopName || "Your backyard shop";

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Catalog</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {shopName}
        </h1>
        {settings.bio ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{settings.bio}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <p className={settings.acceptingOrders ? "font-semibold text-brand" : "font-semibold text-danger"}>
            {settings.acceptingOrders ? "Accepting orders" : "Not taking orders right now"}
          </p>
          {settings.contactPhone ? (
            <p className="text-foreground">
              Call or text:{" "}
              <a className="font-semibold underline underline-offset-2" href={`tel:${settings.contactPhone}`}>
                {settings.contactPhone}
              </a>
            </p>
          ) : null}
        </div>
        {!settings.shopName ? (
          <p className="mt-4 text-sm text-muted">
            Vendor?{" "}
            <Link href="/settings" className="font-semibold text-brand underline underline-offset-2">
              Add your shop details
            </Link>{" "}
            so customers know who you are.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="products-heading" aria-busy={!ready}>
        <h2 id="products-heading" className="font-display text-2xl font-semibold text-foreground">
          What&apos;s on offer
        </h2>
        {!ready ? (
          <p className="mt-4 text-muted">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border bg-surface p-6 text-muted">
            <p>No products listed yet.</p>
            <Link href="/products/new" className="mt-2 inline-block font-semibold text-brand underline underline-offset-2">
              Add your first product
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} currency={settings.defaultCurrency} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function CatalogView() {
  const { products, ready } = useProducts();
  const { settings } = useSettings();
  return <CatalogContent products={products} settings={settings} ready={ready} />;
}
