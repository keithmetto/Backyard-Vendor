/**
 * Vendor settings persistence helpers (pure). The storage key is fixed by
 * project rule 2 in CLAUDE.md.
 */

export const SETTINGS_STORAGE_KEY = "backyard-vendor-settings";

export const DEFAULT_SETTINGS = {
  shopName: "",
  contactPhone: "",
  contactEmail: "",
  defaultCurrency: "KES",
  acceptingOrders: true,
  bio: "",
};

/**
 * @param {string|null} raw value read from storage
 * @returns {typeof DEFAULT_SETTINGS}
 */
export function parseSettings(raw) {
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_SETTINGS;
    }
    const settings = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (typeof parsed[key] === typeof DEFAULT_SETTINGS[key]) {
        settings[key] = parsed[key];
      }
    }
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * @param {typeof DEFAULT_SETTINGS} settings
 * @returns {string}
 */
export function serializeSettings(settings) {
  return JSON.stringify(settings);
}
