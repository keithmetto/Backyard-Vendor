import Link from "next/link";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export const metadata = {
  title: "Products",
};

const placeholderProducts = [
  { id: "sukuma", name: "Sukuma wiki bundle" },
  { id: "eggs", name: "Farm eggs (tray)" },
  { id: "honey", name: "Backyard honey" },
];

export default function ProductsPage() {
  return (
    <PlaceholderPanel
      title="Products"
      note="Placeholder list — create/edit flows will be added later. No marketplace extras in this scaffold."
    >
      <p>Routed product screens for the vendor catalog milestone.</p>
      <ul className="mt-6 space-y-3">
        {placeholderProducts.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.id}`}
              className="block rounded-[var(--radius)] border border-border px-4 py-3 transition hover:border-brand hover:bg-accent-soft/60"
            >
              <span className="font-medium text-foreground">{product.name}</span>
              <span className="mt-1 block text-sm text-muted">Open detail placeholder</span>
            </Link>
          </li>
        ))}
      </ul>
    </PlaceholderPanel>
  );
}
