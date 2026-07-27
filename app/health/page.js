import PlaceholderPanel from "@/components/PlaceholderPanel";

export const metadata = {
  title: "Health",
};

export const dynamic = "force-dynamic";

async function fetchHealthPayload() {
  const upstreamResponse = await fetch(
    "https://jsonplaceholder.typicode.com/todos/1",
    { cache: "no-store" },
  );

  if (!upstreamResponse.ok) {
    throw new Error(`Upstream health probe failed (${upstreamResponse.status})`);
  }

  const upstream = await upstreamResponse.json();

  return {
    status: "ok",
    checkedAt: new Date().toISOString(),
    env: process.env.NEXT_PUBLIC_APP_ENV ?? "unknown",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "not-set",
    upstream,
  };
}

export default async function HealthPage() {
  let payload;
  let errorMessage;

  try {
    payload = await fetchHealthPayload();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unknown health error";
  }

  return (
    <PlaceholderPanel
      title="Health check"
      note="Server Component page that fetches live JSON and renders it. Also exposed at /api/health for probes."
    >
      <p className="mb-4">
        This route confirms the app can fetch remote data at request time and
        render the result.
      </p>

      {errorMessage ? (
        <p className="rounded-[var(--radius)] border border-danger/30 bg-danger/5 px-4 py-3 text-danger">
          Health check failed: {errorMessage}
        </p>
      ) : (
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-background p-4 text-sm leading-6 text-foreground">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </PlaceholderPanel>
  );
}
