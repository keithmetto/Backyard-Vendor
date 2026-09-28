// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  availabilityLabel,
  parsePrice,
  validateProduct,
  validateProductPrice,
} from "@/lib/product-validation";

describe("parsePrice", () => {
  it("accepts plain numbers, thousands separators and two decimals", () => {
    expect(parsePrice("50")).toBe(50);
    expect(parsePrice("1,200")).toBe(1200);
    expect(parsePrice(" 99.50 ")).toBe(99.5);
    expect(parsePrice(75)).toBe(75);
  });

  it("rejects text, currency words and extra decimals", () => {
    expect(parsePrice("fifty")).toBeNull();
    expect(parsePrice("KES 50")).toBeNull();
    expect(parsePrice("10.999")).toBeNull();
    expect(parsePrice(Number.NaN)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
  });
});

describe("validateProductPrice", () => {
  it("requires a positive amount within the limit", () => {
    expect(validateProductPrice("")).toMatch(/required/i);
    expect(validateProductPrice("0")).toMatch(/greater than zero/i);
    expect(validateProductPrice("2000000")).toMatch(/at most/i);
    expect(validateProductPrice("abc")).toMatch(/number/i);
    expect(validateProductPrice("450")).toBeNull();
  });
});

describe("validateProduct", () => {
  it("returns trimmed values with a numeric price when valid", () => {
    const result = validateProduct({
      name: "  Farm eggs  ",
      description: " Free-range. ",
      price: "450",
      availability: "limited",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.values).toEqual({
      name: "Farm eggs",
      description: "Free-range.",
      price: 450,
      availability: "limited",
    });
  });

  it("reports every invalid field on an empty submit", () => {
    const result = validateProduct({ name: "", price: "", availability: "in_stock" });
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(["name", "price"]);
  });

  it("rejects too-short names, long descriptions and unknown availability", () => {
    const result = validateProduct({
      name: "A",
      description: "x".repeat(401),
      price: "10",
      availability: "discontinued",
    });
    expect(result.errors.name).toBeDefined();
    expect(result.errors.description).toBeDefined();
    expect(result.errors.availability).toBeDefined();
  });

  it("defaults availability to in stock", () => {
    expect(validateProduct({ name: "Honey", price: 800 }).values.availability).toBe("in_stock");
  });
});

describe("availabilityLabel", () => {
  it("maps values to readable labels", () => {
    expect(availabilityLabel("sold_out")).toBe("Sold out");
    expect(availabilityLabel("nope")).toBe("Unknown");
  });
});
