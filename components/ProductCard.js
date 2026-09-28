import Link from "next/link";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product, currency = "KES" }) {
  const soldOut = product.availability === "sold_out";

  return (
    <article className="flex h-full flex-col rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-foreground">
          <Link
            href={`/products/${product.id}`}
            className="underline-offset-2 hover:text-brand hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <AvailabilityBadge availability={product.availability} />
      </div>
      {product.description ? (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">
          {product.description}
        </p>
      ) : (
        <p className="flex-1" />
      )}
      <p
        className={`mt-4 text-lg font-semibold ${soldOut ? "text-muted line-through" : "text-brand"}`}
      >
        {formatPrice(product.price, currency)}
        {soldOut ? <span className="sr-only"> (sold out)</span> : null}
      </p>
    </article>
  );
}
