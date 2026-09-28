import ProductDetail from "@/components/ProductDetail";

export const metadata = {
  title: "Product",
};

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ProductDetail productId={id} />
    </div>
  );
}
