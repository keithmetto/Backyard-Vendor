/**
 * Pure validation helpers for catalog products. No DOM access.
 */

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "limited", label: "Limited stock" },
  { value: "sold_out", label: "Sold out" },
];

const AVAILABILITY_VALUES = AVAILABILITY_OPTIONS.map((option) => option.value);

export const PRODUCT_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  descriptionMax: 400,
  priceMax: 1_000_000,
};

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Accepts numbers or strings like "50", "1,200" or "99.50".
 * @param {unknown} value
 * @returns {number|null} parsed price, or null when it is not a plain amount
 */
export function parsePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const cleaned = value.replace(/[,\s]/g, "");
  if (!PRICE_PATTERN.test(cleaned)) {
    return null;
  }
  return Number(cleaned);
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateProductName(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return "Product name is required.";
  }
  if (
    trimmed.length < PRODUCT_LIMITS.nameMin ||
    trimmed.length > PRODUCT_LIMITS.nameMax
  ) {
    return `Product name must be between ${PRODUCT_LIMITS.nameMin} and ${PRODUCT_LIMITS.nameMax} characters.`;
  }
  return null;
}

/**
 * Optional description with a length cap.
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateProductDescription(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed.length > PRODUCT_LIMITS.descriptionMax) {
    return `Description must be at most ${PRODUCT_LIMITS.descriptionMax} characters.`;
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateProductPrice(value) {
  if (value === "" || value === null || value === undefined) {
    return "Price is required.";
  }
  const price = parsePrice(value);
  if (price === null) {
    return "Enter a price as a number, e.g. 50 or 1,200.";
  }
  if (price <= 0) {
    return "Price must be greater than zero.";
  }
  if (price > PRODUCT_LIMITS.priceMax) {
    return "Price must be at most 1,000,000.";
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateAvailability(value) {
  if (!AVAILABILITY_VALUES.includes(value)) {
    return "Choose in stock, limited stock, or sold out.";
  }
  return null;
}

/**
 * @param {object} input
 * @returns {{ valid: boolean, errors: Record<string, string>, values: { name: string, description: string, price: number|null, availability: string } }}
 */
export function validateProduct(input = {}) {
  const values = {
    name: typeof input.name === "string" ? input.name.trim() : "",
    description:
      typeof input.description === "string" ? input.description.trim() : "",
    price: parsePrice(input.price),
    availability: input.availability || "in_stock",
  };

  const errors = {};

  const nameError = validateProductName(input.name);
  if (nameError) errors.name = nameError;

  const descriptionError = validateProductDescription(input.description);
  if (descriptionError) errors.description = descriptionError;

  const priceError = validateProductPrice(input.price);
  if (priceError) errors.price = priceError;

  const availabilityError = validateAvailability(values.availability);
  if (availabilityError) errors.availability = availabilityError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  };
}

/**
 * @param {string} value
 * @returns {string}
 */
export function availabilityLabel(value) {
  return (
    AVAILABILITY_OPTIONS.find((option) => option.value === value)?.label ??
    "Unknown"
  );
}
