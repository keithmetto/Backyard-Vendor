import ProductEditor from "@/components/ProductEditor";

export const metadata = {
  title: "Add product",
};

export default function NewProductPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Add product
        </h1>
        <p className="mt-2 text-base text-muted">
          Let the AI draft it from your notes, or fill in the form yourself.
        </p>
      </header>
      <ProductEditor />
    </div>
  );
}
