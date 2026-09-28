/**
 * Pure validation for "Draft from notes" input. No DOM access and no zod, so
 * the browser can import it without pulling the AI schema into the bundle.
 */

export const NOTES_LIMITS = { min: 8, max: 600 };

/**
 * @param {unknown} notes
 * @returns {string|null}
 */
export function validateNotes(notes) {
  const trimmed = typeof notes === "string" ? notes.trim() : "";
  if (trimmed.length < NOTES_LIMITS.min) {
    return `Describe the product in at least ${NOTES_LIMITS.min} characters.`;
  }
  if (trimmed.length > NOTES_LIMITS.max) {
    return `Keep notes under ${NOTES_LIMITS.max} characters.`;
  }
  return null;
}
