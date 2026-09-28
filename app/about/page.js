import PlaceholderPanel from "@/components/PlaceholderPanel";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <PlaceholderPanel title="About Backyard Vendor">
      <p>
        Backyard Vendor is a small catalog tool for backyard sellers, home
        bakers, and market-stall vendors who sell to their neighbours. Vendors
        list what they have, at what price, and whether it&apos;s still
        available; customers see a clean catalog and a number to call.
      </p>
      <p className="mt-3">
        Writing listings is the slow part, so the product form can draft a
        listing from rough notes like &ldquo;chapati 50 bob each, made fresh
        every morning&rdquo;. The AI never saves anything and never guesses a
        price; the vendor reviews every draft.
      </p>
      <p className="mt-3">
        It is deliberately not a marketplace: no payments, accounts, or
        delivery. Data is stored in your browser.
      </p>
    </PlaceholderPanel>
  );
}
