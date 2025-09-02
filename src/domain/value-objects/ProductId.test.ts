import { describe, it, expect } from "vitest";
import { ProductId } from "@/domain/value-objects/ProductId";

describe("ProductId", () => {
  describe("fromString", () => {
    it("should create ProductId from valid UUID", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const productId = ProductId.fromString(uuid);

      expect(productId.toString()).toBe(uuid);
    });

    it("should create ProductId from valid custom format", () => {
      const customId = "MLA123456";
      const productId = ProductId.fromString(customId);

      expect(productId.toString()).toBe(customId);
    });

    it("should throw error for empty string", () => {
      expect(() => ProductId.fromString("")).toThrow(
        "ProductId cannot be empty",
      );
    });

    it("should throw error for whitespace only", () => {
      expect(() => ProductId.fromString("   ")).toThrow(
        "ProductId cannot be empty",
      );
    });

    it("should throw error for invalid format", () => {
      expect(() => ProductId.fromString("invalid-id")).toThrow(
        "Invalid ProductId format",
      );
    });

    it("should throw error for custom format with insufficient digits", () => {
      expect(() => ProductId.fromString("MLA123")).toThrow(
        "Invalid ProductId format",
      );
    });
  });

  describe("generate", () => {
    it("should generate valid ProductId", () => {
      const productId = ProductId.generate();

      expect(productId.toString()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate different IDs on multiple calls", () => {
      const id1 = ProductId.generate();
      const id2 = ProductId.generate();

      expect(id1.toString()).not.toBe(id2.toString());
    });
  });

  describe("equals", () => {
    it("should return true for equal ProductIds", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const productId1 = ProductId.fromString(id);
      const productId2 = ProductId.fromString(id);

      expect(productId1.equals(productId2)).toBe(true);
    });

    it("should return false for different ProductIds", () => {
      const productId1 = ProductId.fromString(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      const productId2 = ProductId.fromString("MLA123456");

      expect(productId1.equals(productId2)).toBe(false);
    });
  });
});
