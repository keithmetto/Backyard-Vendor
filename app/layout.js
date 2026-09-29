import Link from "next/link";
import { Fraunces, Figtree } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Backyard Vendor",
    template: "%s · Backyard Vendor",
  },
  description:
    "Help small local vendors present products, manage listings, and prepare for customer orders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:text-brand"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-border bg-surface py-6 text-center text-sm text-muted">
          Backyard Vendor · a catalog for small local vendors ·{" "}
          <Link href="/health" className="underline underline-offset-2 hover:text-brand">
            Status
          </Link>
        </footer>
      </body>
    </html>
  );
}
