"use client";

import Link from "next/link";
import { useState } from "react";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { formatPrice } from "@/lib/format";
import { removeProduct } from "@/lib/product-store";
import { useProducts, useSettings } from "@/lib/use-stored-value";

export function ProductList({ products, currency, ready, onDelete }) {
  const [status, setStatus] = useState("");

  function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    const ok = onDelete(product.id);
    setStatus(ok === false ? `Couldn't delete "${product.name}". Try again.` : `Deleted "${product.name}".`);
  }

  return (
    <div className="space-y-4">
      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-brand">
        {status}
      </p>
      {!ready ? (
        <p className="text-muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="rounded-[var(--radius)] border border-dashed border-border bg-surface p-6 text-muted">
          No products yet. Add one to start your catalog.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{product.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                  {formatPrice(product.price, currency)}
                  <AvailabilityBadge availability={product.availability} />
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/products/${product.id}/edit`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-brand hover:border-brand"
                >
                  Edit<span className="sr-only"> {product.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-danger hover:border-danger"
                >
                  Delete<span className="sr-only"> {product.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductManager() {
  const { products, ready, saveProducts } = useProducts();
  const { settings } = useSettings();

  return (
    <ProductList
      products={products}
      currency={settings.defaultCurrency}
      ready={ready}
      onDelete={(id) => saveProducts(removeProduct(products, id))}
    />
  );
}
