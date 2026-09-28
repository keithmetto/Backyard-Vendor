// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  PRODUCTS_STORAGE_KEY,
  SEED_PRODUCTS,
  addProduct,
  createProductId,
  findProduct,
  parseProducts,
  removeProduct,
  serializeProducts,
  updateProduct,
} from "@/lib/product-store";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  parseSettings,
  serializeSettings,
} from "@/lib/settings-store";
import { formatPrice } from "@/lib/format";

describe("storage keys", () => {
  it("uses the fixed project keys", () => {
    expect(SETTINGS_STORAGE_KEY).toBe("backyard-vendor-settings");
    expect(PRODUCTS_STORAGE_KEY).toBe("backyard-vendor-products");
  });
});

describe("parseProducts", () => {
  it("returns seed products when nothing is stored", () => {
    expect(parseProducts(null)).toBe(SEED_PRODUCTS);
  });

  it("keeps an intentionally empty catalog empty", () => {
    expect(parseProducts("[]")).toEqual([]);
  });

  it("falls back to seed data on corrupt JSON or a non-array", () => {
    expect(parseProducts("{not json")).toBe(SEED_PRODUCTS);
    expect(parseProducts('{"a":1}')).toBe(SEED_PRODUCTS);
  });

  it("drops stored items that are no longer valid", () => {
    const raw = JSON.stringify([
      { id: "ok", name: "Honey", price: 800, availability: "in_stock", description: "" },
      { id: "bad", name: "", price: -1, availability: "in_stock" },
      { name: "No id", price: 5, availability: "in_stock" },
    ]);
    expect(parseProducts(raw).map((p) => p.id)).toEqual(["ok"]);
  });

  it("round-trips through serializeProducts", () => {
    expect(parseProducts(serializeProducts(SEED_PRODUCTS))).toEqual(SEED_PRODUCTS);
  });
});

describe("product updates", () => {
  const values = { name: "Chapati", description: "", price: 50, availability: "in_stock" };

  it("creates unique slug ids", () => {
    expect(createProductId("Farm Eggs (tray)!", [])).toBe("farm-eggs-tray");
    expect(createProductId("Chapati", ["chapati", "chapati-2"])).toBe("chapati-3");
    expect(createProductId("!!!", [])).toBe("product");
  });

  it("adds new products to the top", () => {
    const { products, product } = addProduct(SEED_PRODUCTS, values);
    expect(products[0]).toBe(product);
    expect(product.id).toBe("chapati");
    expect(products).toHaveLength(SEED_PRODUCTS.length + 1);
  });

  it("updates in place without changing the id", () => {
    const next = updateProduct(SEED_PRODUCTS, "backyard-honey", { ...values, id: "hack" });
    const honey = findProduct(next, "backyard-honey");
    expect(honey.name).toBe("Chapati");
    expect(findProduct(next, "hack")).toBeUndefined();
  });

  it("removes by id", () => {
    expect(findProduct(removeProduct(SEED_PRODUCTS, "farm-eggs-tray"), "farm-eggs-tray")).toBeUndefined();
  });
});

describe("parseSettings", () => {
  it("returns defaults for missing or corrupt data", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("oops")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("[1,2]")).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps known keys with the right type and ignores the rest", () => {
    const raw = JSON.stringify({ shopName: "Amina Yard", acceptingOrders: "yes", extra: 1 });
    const settings = parseSettings(raw);
    expect(settings.shopName).toBe("Amina Yard");
    expect(settings.acceptingOrders).toBe(true);
    expect(settings).not.toHaveProperty("extra");
  });

  it("round-trips through serializeSettings", () => {
    const settings = { ...DEFAULT_SETTINGS, shopName: "Amina Yard" };
    expect(parseSettings(serializeSettings(settings))).toEqual(settings);
  });
});

describe("formatPrice", () => {
  it("formats KES and USD amounts", () => {
    expect(formatPrice(1200, "KES")).toMatch(/1,200/);
    expect(formatPrice(9.5, "USD")).toBe("$9.50");
  });
});
