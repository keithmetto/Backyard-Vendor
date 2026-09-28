"use client";

import Link from "next/link";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { formatPrice } from "@/lib/format";
import { findProduct } from "@/lib/product-store";
import { useProducts, useSettings } from "@/lib/use-stored-value";

export default function ProductDetail({ productId }) {
  const { products, ready } = useProducts();
  const { settings } = useSettings();

  if (!ready) {
    return <p className="text-muted">Loading product…</p>;
  }

  const product = findProduct(products, productId);

  if (!product) {
    return (
      <section className="rounded-[var(--radius)] border border-border bg-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Product not found</h1>
        <p className="mt-3 text-muted">It may have been removed from the catalog.</p>
        <Link href="/" className="mt-4 inline-block font-semibold text-brand underline underline-offset-2">
          Back to catalog
        </Link>
      </section>
    );
  }

  return (
    <article className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {product.name}
        </h1>
        <AvailabilityBadge availability={product.availability} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-brand">
        {formatPrice(product.price, settings.defaultCurrency)}
      </p>
      {product.description ? (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-7 text-foreground">
          {product.description}
        </p>
      ) : null}
      {settings.contactPhone ? (
        <p className="mt-6 text-sm text-foreground">
          To order, call or text{" "}
          <a className="font-semibold underline underline-offset-2" href={`tel:${settings.contactPhone}`}>
            {settings.contactPhone}
          </a>
          .
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-sm font-semibold">
        <Link href="/" className="text-brand underline underline-offset-2">
          Back to catalog
        </Link>
        <Link href={`/products/${product.id}/edit`} className="text-brand underline underline-offset-2">
          Edit product
        </Link>
      </div>
    </article>
  );
}
