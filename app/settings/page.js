import PlaceholderPanel from "@/components/PlaceholderPanel";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PlaceholderPanel
      title="Vendor settings"
      note="Placeholder — the Week 2 validation form (legacy/settings-drill) will be ported here without inventing marketplace scope."
    >
      <p>
        Shop name, Kenyan contact phone, optional email, currency, accepting
        orders, and bio will live on this route. Persistence key remains{" "}
        <code className="rounded bg-accent-soft px-1.5 py-0.5 text-sm text-foreground">
          backyard-vendor-settings
        </code>
        .
      </p>
    </PlaceholderPanel>
  );
}
