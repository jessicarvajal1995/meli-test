import { describe, it, expect } from "vitest";
import { Price } from "@/domain/value-objects/Price";

describe("Price", () => {
  describe("constructor", () => {
    it("should create Price with valid parameters", () => {
      const price = new Price(100.5, "ARS");

      expect(price.getAmount()).toBe(100.5);
      expect(price.getCurrency()).toBe("ARS");
      expect(price.getOriginalAmount()).toBeUndefined();
    });

    it("should create Price with discount", () => {
      const price = new Price(80.0, "ARS", 100.0);

      expect(price.getAmount()).toBe(80.0);
      expect(price.getCurrency()).toBe("ARS");
      expect(price.getOriginalAmount()).toBe(100.0);
    });

    it("should throw error for negative amount", () => {
      expect(() => new Price(-10, "ARS")).toThrow(
        "Price amount cannot be negative",
      );
    });

    it("should throw error for empty currency", () => {
      expect(() => new Price(100, "")).toThrow("Currency cannot be empty");
    });

    it("should throw error for negative original amount", () => {
      expect(() => new Price(100, "ARS", -50)).toThrow(
        "Original price amount cannot be negative",
      );
    });

    it("should throw error when original price is less than current price", () => {
      expect(() => new Price(100, "ARS", 80)).toThrow(
        "Original price cannot be less than current price",
      );
    });
  });

  describe("hasDiscount", () => {
    it("should return true when there is a discount", () => {
      const price = new Price(80.0, "ARS", 100.0);

      expect(price.hasDiscount()).toBe(true);
    });

    it("should return false when there is no discount", () => {
      const price = new Price(100.0, "ARS");

      expect(price.hasDiscount()).toBe(false);
    });

    it("should return false when original amount equals current amount", () => {
      const price = new Price(100.0, "ARS", 100.0);

      expect(price.hasDiscount()).toBe(false);
    });
  });

  describe("getDiscountPercentage", () => {
    it("should calculate discount percentage correctly", () => {
      const price = new Price(80.0, "ARS", 100.0);

      expect(price.getDiscountPercentage()).toBe(20);
    });

    it("should return 0 when there is no discount", () => {
      const price = new Price(100.0, "ARS");

      expect(price.getDiscountPercentage()).toBe(0);
    });

    it("should round discount percentage", () => {
      const price = new Price(66.67, "ARS", 100.0);

      expect(price.getDiscountPercentage()).toBe(33); 
    });
  });

  describe("format", () => {
    it("should format price correctly", () => {
      const price = new Price(1234.5, "ARS");

      expect(price.format()).toBe("ARS 1.234,50");
    });

    it("should format price with zeros", () => {
      const price = new Price(100, "USD");

      expect(price.format()).toBe("USD 100,00");
    });
  });

  describe("equals", () => {
    it("should return true for equal prices", () => {
      const price1 = new Price(100.0, "ARS", 120.0);
      const price2 = new Price(100.0, "ARS", 120.0);

      expect(price1.equals(price2)).toBe(true);
    });

    it("should return false for different amounts", () => {
      const price1 = new Price(100.0, "ARS");
      const price2 = new Price(200.0, "ARS");

      expect(price1.equals(price2)).toBe(false);
    });

    it("should return false for different currencies", () => {
      const price1 = new Price(100.0, "ARS");
      const price2 = new Price(100.0, "USD");

      expect(price1.equals(price2)).toBe(false);
    });

    it("should return false for different original amounts", () => {
      const price1 = new Price(100.0, "ARS", 120.0);
      const price2 = new Price(100.0, "ARS", 130.0);

      expect(price1.equals(price2)).toBe(false);
    });
  });
});
