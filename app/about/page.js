import PlaceholderPanel from "@/components/PlaceholderPanel";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <PlaceholderPanel
      title="About Backyard Vendor"
      note="Placeholder screen from the capstone scaffold."
    >
      <p>
        Backyard Vendor helps small local vendors present products, manage
        basic listings, and prepare for customer orders — without turning the
        first milestone into a full marketplace.
      </p>
    </PlaceholderPanel>
  );
}
