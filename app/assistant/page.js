import VendorChat from "@/components/VendorChat";

export const metadata = {
  title: "Listing Assistant",
  description:
    "Stream a conversation with the Backyard Vendor listing assistant.",
};

export default function AssistantPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Listing Assistant
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted">
          Capstone AI interaction (FE-06): ask for product titles, descriptions,
          or pricing language and watch the reply stream token by token. Use
          Stop mid-reply, then send again.
        </p>
      </header>

      <VendorChat />
    </div>
  );
}
