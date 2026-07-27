import Link from "next/link";

const links = [
  { href: "/", label: "Catalog" },
  { href: "/products", label: "Products" },
  { href: "/settings", label: "Settings" },
  { href: "/about", label: "About" },
  { href: "/health", label: "Health" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-brand">
          Backyard Vendor
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
