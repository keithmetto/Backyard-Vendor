// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  validateBio,
  validateContactEmail,
  validateContactPhone,
  validateSettings,
  validateShopName,
} from "@/lib/settings-validation";

const valid = {
  shopName: "Amina Yard",
  contactPhone: "0712345678",
  contactEmail: "",
  defaultCurrency: "KES",
  acceptingOrders: true,
  bio: "",
};

describe("validateSettings", () => {
  it("fails an empty submit on the required fields only", () => {
    const result = validateSettings({ ...valid, shopName: "", contactPhone: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.shopName).toBeDefined();
    expect(result.errors.contactPhone).toBeDefined();
    expect(result.errors.contactEmail).toBeUndefined();
  });

  it("passes the Amina Yard example", () => {
    const result = validateSettings(valid);
    expect(result.valid).toBe(true);
    expect(result.values.shopName).toBe("Amina Yard");
  });

  it("rejects an invalid email when everything else is valid", () => {
    const result = validateSettings({ ...valid, contactEmail: "not-an-email" });
    expect(Object.keys(result.errors)).toEqual(["contactEmail"]);
  });

  it("defaults currency to KES and acceptingOrders to true", () => {
    const result = validateSettings({ shopName: "Amina Yard", contactPhone: "0712345678" });
    expect(result.values.defaultCurrency).toBe("KES");
    expect(result.values.acceptingOrders).toBe(true);
  });

  it("rejects unknown currencies", () => {
    expect(validateSettings({ ...valid, defaultCurrency: "EUR" }).errors.defaultCurrency).toBeDefined();
  });
});

describe("Kenyan phone format (project rule 4)", () => {
  it.each(["0712345678", "+254712345678", "  0712345678  "])("accepts %s", (phone) => {
    expect(validateContactPhone(phone)).toBeNull();
  });

  it.each(["123", "254712345678", "0812345678", "+2540712345678", "07123456789", "0712 345 678"])(
    "rejects %s",
    (phone) => {
      expect(validateContactPhone(phone)).not.toBeNull();
    },
  );
});

describe("field helpers", () => {
  it("checks shop name length", () => {
    expect(validateShopName("A")).not.toBeNull();
    expect(validateShopName("x".repeat(61))).not.toBeNull();
  });

  it("allows an empty optional email", () => {
    expect(validateContactEmail("   ")).toBeNull();
  });

  it("caps bio at 200 characters", () => {
    expect(validateBio("x".repeat(200))).toBeNull();
    expect(validateBio("x".repeat(201))).not.toBeNull();
  });
});
