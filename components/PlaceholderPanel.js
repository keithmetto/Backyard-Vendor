export default function PlaceholderPanel({ title, children, note }) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow)] sm:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <div className="mt-4 max-w-2xl text-base leading-7 text-muted">{children}</div>
      {note ? (
        <p className="mt-6 border-t border-border pt-4 text-sm text-muted">{note}</p>
      ) : null}
    </section>
  );
}
