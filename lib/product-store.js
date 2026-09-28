import { validateProduct } from "@/lib/product-validation";

/**
 * Catalog persistence helpers. Parsing and array updates are pure so they can
 * be tested without a browser; `lib/use-stored-value.js` does the I/O.
 */

export const PRODUCTS_STORAGE_KEY = "backyard-vendor-products";

export const SEED_PRODUCTS = [
  {
    id: "sukuma-wiki-bundle",
    name: "Sukuma wiki bundle",
    description:
      "Freshly picked sukuma wiki from the backyard garden, washed and tied in generous bundles.",
    price: 30,
    availability: "in_stock",
  },
  {
    id: "farm-eggs-tray",
    name: "Farm eggs (tray of 30)",
    description:
      "Free-range eggs from our own hens. Collected daily, brown shells, sizes vary.",
    price: 450,
    availability: "limited",
  },
  {
    id: "backyard-honey",
    name: "Backyard honey (500g)",
    description:
      "Raw honey from two hives behind the house. Next harvest expected next month.",
    price: 800,
    availability: "sold_out",
  },
];

function isStoredProduct(item) {
  if (!item || typeof item !== "object" || typeof item.id !== "string") {
    return false;
  }
  return validateProduct(item).valid;
}

/**
 * @param {string|null} raw value read from storage
 * @returns {Array<object>} products; seed data when nothing valid is stored
 */
export function parseProducts(raw) {
  if (raw === null || raw === undefined) {
    return SEED_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return SEED_PRODUCTS;
    }
    return parsed.filter(isStoredProduct);
  } catch {
    return SEED_PRODUCTS;
  }
}

/**
 * @param {Array<object>} products
 * @returns {string}
 */
export function serializeProducts(products) {
  return JSON.stringify(products);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * @param {string} name
 * @param {string[]} existingIds
 * @returns {string} URL-safe id that does not collide with existing ids
 */
export function createProductId(name, existingIds = []) {
  const base = slugify(name) || "product";
  if (!existingIds.includes(base)) {
    return base;
  }
  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

/**
 * @param {Array<object>} products
 * @param {object} values validated product values
 * @returns {{ products: Array<object>, product: object }}
 */
export function addProduct(products, values) {
  const product = {
    id: createProductId(
      values.name,
      products.map((item) => item.id),
    ),
    ...values,
  };
  return { products: [product, ...products], product };
}

/**
 * @param {Array<object>} products
 * @param {string} id
 * @param {object} values validated product values
 * @returns {Array<object>}
 */
export function updateProduct(products, id, values) {
  return products.map((item) => (item.id === id ? { ...item, ...values, id } : item));
}

/**
 * @param {Array<object>} products
 * @param {string} id
 * @returns {Array<object>}
 */
export function removeProduct(products, id) {
  return products.filter((item) => item.id !== id);
}

/**
 * @param {Array<object>} products
 * @param {string} id
 * @returns {object|undefined}
 */
export function findProduct(products, id) {
  return products.find((item) => item.id === id);
}
