import Link from "next/link";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Product ${id}`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  return (
    <PlaceholderPanel
      title={`Product: ${id}`}
      note="Placeholder detail — price, availability, and description will be wired to real data later."
    >
      <p>
        This dynamic route exists so every product screen from the capstone
        spec has a URL today.
      </p>
      <p className="mt-4">
        <Link href="/products" className="font-medium text-brand underline-offset-2 hover:underline">
          Back to products
        </Link>
      </p>
    </PlaceholderPanel>
  );
}
