export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-danger";

/**
 * Label + control + hint + error. The render prop receives the id and ARIA
 * attributes so every control is tied to its visible error (`{id}-error`).
 */
export default function FormField({ id, label, hint, error, optional, children }) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-foreground">
        {label}
        {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
      </label>
      {children({
        id,
        name: id,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": describedBy,
      })}
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
