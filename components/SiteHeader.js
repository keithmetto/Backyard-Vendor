import Link from "next/link";
import NavLinks from "@/components/NavLinks";

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-brand">
          Backyard Vendor
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
