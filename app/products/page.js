import Link from "next/link";
import ProductManager from "@/components/ProductManager";

export const metadata = {
  title: "Manage products",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Manage products
          </h1>
          <p className="mt-2 text-base text-muted">
            Add, edit, or remove what customers see in your catalog.
          </p>
        </div>
        <Link
          href="/products/new"
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Add product
        </Link>
      </header>
      <ProductManager />
    </div>
  );
}
