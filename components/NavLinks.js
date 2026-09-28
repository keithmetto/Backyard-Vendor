"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Catalog" },
  { href: "/products", label: "Manage products" },
  { href: "/assistant", label: "Assistant" },
  { href: "/settings", label: "Settings" },
  { href: "/about", label: "About" },
];

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function NavLinks() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`transition-colors hover:text-brand ${active ? "text-brand underline underline-offset-4" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
