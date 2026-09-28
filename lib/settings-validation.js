/**
 * Pure validation helpers for vendor settings. No DOM access.
 */

const PHONE_PATTERN = /^(07\d{8}|\+2547\d{8})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CURRENCIES = ["KES", "USD"];

/**
 * @param {unknown} value
 * @returns {string|null} error message or null if valid
 */
export function validateShopName(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return "Shop name is required.";
  }
  if (trimmed.length < 2 || trimmed.length > 60) {
    return "Shop name must be between 2 and 60 characters.";
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateContactPhone(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return "Contact phone is required.";
  }
  if (!PHONE_PATTERN.test(trimmed)) {
    return "Enter a Kenyan mobile number (07XXXXXXXX or +2547XXXXXXXX).";
  }
  return null;
}

/**
 * Optional email: empty is valid; otherwise must look like an email.
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateContactEmail(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return null;
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateBio(value) {
  const text = typeof value === "string" ? value : "";
  if (text.trim().length === 0) {
    return null;
  }
  if (text.length > 200) {
    return "Bio must be at most 200 characters.";
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
export function validateDefaultCurrency(value) {
  if (!CURRENCIES.includes(value)) {
    return "Currency must be KES or USD.";
  }
  return null;
}

/**
 * @param {object} input
 * @returns {{ valid: boolean, errors: Record<string, string>, values: object }}
 */
export function validateSettings(input = {}) {
  const values = {
    shopName: typeof input.shopName === "string" ? input.shopName.trim() : "",
    contactPhone:
      typeof input.contactPhone === "string" ? input.contactPhone.trim() : "",
    contactEmail:
      typeof input.contactEmail === "string" ? input.contactEmail.trim() : "",
    defaultCurrency:
      input.defaultCurrency === undefined || input.defaultCurrency === ""
        ? "KES"
        : input.defaultCurrency,
    acceptingOrders:
      input.acceptingOrders === undefined ? true : Boolean(input.acceptingOrders),
    bio: typeof input.bio === "string" ? input.bio.trim() : "",
  };

  const errors = {};

  const shopNameError = validateShopName(input.shopName);
  if (shopNameError) errors.shopName = shopNameError;

  const phoneError = validateContactPhone(input.contactPhone);
  if (phoneError) errors.contactPhone = phoneError;

  const emailError = validateContactEmail(input.contactEmail);
  if (emailError) errors.contactEmail = emailError;

  const currencyError = validateDefaultCurrency(values.defaultCurrency);
  if (currencyError) errors.defaultCurrency = currencyError;

  const bioError = validateBio(input.bio);
  if (bioError) errors.bio = bioError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  };
}
