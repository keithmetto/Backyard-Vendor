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
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          Backyard Vendor · capstone scaffold
        </footer>
      </body>
    </html>
  );
}
