import { availabilityLabel } from "@/lib/product-validation";

const STYLES = {
  in_stock: "bg-brand/10 text-brand-strong",
  limited: "bg-accent-soft text-[#5c4410]",
  sold_out: "bg-border/60 text-foreground",
};

export default function AvailabilityBadge({ availability }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STYLES[availability] ?? STYLES.sold_out
      }`}
    >
      {availabilityLabel(availability)}
    </span>
  );
}
