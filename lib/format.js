/**
 * @param {number} amount
 * @param {"KES"|"USD"} currency
 * @returns {string}
 */
export function formatPrice(amount, currency = "KES") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
