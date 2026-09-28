import ProductEditor from "@/components/ProductEditor";

export const metadata = {
  title: "Edit product",
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Edit product
        </h1>
        <p className="mt-2 text-base text-muted">
          Update the details, or redraft them from new notes.
        </p>
      </header>
      <ProductEditor productId={id} />
    </div>
  );
}
