"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { addProduct, findProduct, updateProduct } from "@/lib/product-store";
import { useProducts, useSettings } from "@/lib/use-stored-value";

/**
 * Create (no `productId`) or edit (with `productId`) a product, then return
 * to the product detail page.
 */
export default function ProductEditor({ productId }) {
  const router = useRouter();
  const { products, ready, saveProducts } = useProducts();
  const { settings } = useSettings();

  if (!ready) {
    return <p className="text-muted">Loading…</p>;
  }

  const existing = productId ? findProduct(products, productId) : null;

  if (productId && !existing) {
    return (
      <div className="space-y-3">
        <p className="text-foreground">That product doesn&apos;t exist (it may have been deleted).</p>
        <Link href="/products" className="font-semibold text-brand underline underline-offset-2">
          Back to products
        </Link>
      </div>
    );
  }

  function handleSubmit(values) {
    if (existing) {
      if (!saveProducts(updateProduct(products, existing.id, values))) return false;
      router.push(`/products/${existing.id}`);
      return true;
    }
    const { products: next, product } = addProduct(products, values);
    if (!saveProducts(next)) return false;
    router.push(`/products/${product.id}`);
    return true;
  }

  return (
    <ProductForm
      key={existing?.id ?? "new"}
      product={existing}
      currency={settings.defaultCurrency}
      submitLabel={existing ? "Save changes" : "Add product"}
      onSubmit={handleSubmit}
    />
  );
}
