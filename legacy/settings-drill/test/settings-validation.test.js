import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateSettings,
  validateShopName,
  validateContactPhone,
  validateContactEmail,
  validateBio,
} from "../js/settings-validation.js";

describe("validateSettings — example behaviors", () => {
  it("empty submit shows required field errors and is not valid", () => {
    const result = validateSettings({
      shopName: "",
      contactPhone: "",
      contactEmail: "",
      defaultCurrency: "KES",
      acceptingOrders: true,
      bio: "",
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.shopName);
    assert.ok(result.errors.contactPhone);
    assert.equal(result.errors.contactEmail, undefined);
  });

  it("valid Amina Yard / 0712345678 / KES saves (valid)", () => {
    const result = validateSettings({
      shopName: "Amina Yard",
      contactPhone: "0712345678",
      contactEmail: "",
      defaultCurrency: "KES",
      acceptingOrders: true,
      bio: "",
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.values.shopName, "Amina Yard");
    assert.equal(result.values.contactPhone, "0712345678");
    assert.equal(result.values.defaultCurrency, "KES");
  });

  it("phone 123 is invalid and does not pass validation", () => {
    const result = validateSettings({
      shopName: "Amina Yard",
      contactPhone: "123",
      contactEmail: "",
      defaultCurrency: "KES",
      acceptingOrders: true,
      bio: "",
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.contactPhone);
  });

  it("invalid email with otherwise valid fields fails on email", () => {
    const result = validateSettings({
      shopName: "Amina Yard",
      contactPhone: "0712345678",
      contactEmail: "not-an-email",
      defaultCurrency: "KES",
      acceptingOrders: true,
      bio: "",
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.contactEmail);
    assert.equal(result.errors.shopName, undefined);
    assert.equal(result.errors.contactPhone, undefined);
  });
});

describe("field helpers", () => {
  it("accepts +2547XXXXXXXX phone format", () => {
    assert.equal(validateContactPhone("+254712345678"), null);
  });

  it("rejects short shop names", () => {
    assert.ok(validateShopName("A"));
  });

  it("allows empty optional email", () => {
    assert.equal(validateContactEmail(""), null);
    assert.equal(validateContactEmail("   "), null);
  });

  it("rejects bio over 200 characters", () => {
    assert.ok(validateBio("x".repeat(201)));
    assert.equal(validateBio("x".repeat(200)), null);
  });

  it("defaults currency to KES and acceptingOrders to true when missing", () => {
    const result = validateSettings({
      shopName: "Amina Yard",
      contactPhone: "0712345678",
    });

    assert.equal(result.valid, true);
    assert.equal(result.values.defaultCurrency, "KES");
    assert.equal(result.values.acceptingOrders, true);
  });
});
