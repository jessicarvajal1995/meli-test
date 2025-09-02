import { describe, it, expect } from "vitest";
import { Product } from "./Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";

describe("Product", () => {
  const createMockProduct = (overrides: Partial<{
    id: ProductId;
    title: string;
    description: string;
    price: Price;
    categoryId: string;
    status: ProductStatus;
    stock: ProductStock;
    createdAt: Date;
    updatedAt: Date;
  }> = {}) => {
    const mockDate = new Date("2023-01-01T00:00:00Z");
    const mockPrice = new Price(1000, "USD");

    return new Product(
      overrides.id || ProductId.fromString("ABC123456"),
      overrides.title || "Test Product",
      overrides.description || "Test Description",
      overrides.price || mockPrice,
      overrides.categoryId || "cat-1",
      overrides.status || ProductStatus.fromString("active"),
      overrides.stock || ProductStock.fromNumber(10),
      overrides.createdAt || mockDate,
      overrides.updatedAt || mockDate,
    );
  };

  describe("constructor", () => {
    it("should create a product with all required properties", () => {
      const product = createMockProduct();

      expect(product.id.toString()).toBe("ABC123456");
      expect(product.title).toBe("Test Product");
      expect(product.description).toBe("Test Description");
      expect(product.price.getAmount()).toBe(1000);
      expect(product.price.getCurrency()).toBe("USD");
      expect(product.categoryId).toBe("cat-1");
      expect(product.status.toString()).toBe("active");
      expect(product.stock.getValue()).toBe(10);
      expect(product.createdAt).toEqual(new Date("2023-01-01T00:00:00Z"));
      expect(product.updatedAt).toEqual(new Date("2023-01-01T00:00:00Z"));
    });
  });

  describe("isAvailable", () => {
    it("should return true when product is active and has stock", () => {
      const product = createMockProduct({
        status: ProductStatus.fromString("active"),
        stock: ProductStock.fromNumber(5),
      });

      expect(product.isAvailable()).toBe(true);
    });

    it("should return false when product is inactive", () => {
      const product = createMockProduct({
        status: ProductStatus.fromString("inactive"),
      });

      expect(product.isAvailable()).toBe(false);
    });

    it("should return false when product has no stock", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(0),
      });

      expect(product.isAvailable()).toBe(false);
    });

    it("should return false when product is inactive and has no stock", () => {
      const product = createMockProduct({
        status: ProductStatus.fromString("inactive"),
        stock: ProductStock.fromNumber(0),
      });

      expect(product.isAvailable()).toBe(false);
    });
  });

  describe("hasStock", () => {
    it("should return true when product has sufficient stock", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(10),
      });

      expect(product.hasStock(5)).toBe(true);
      expect(product.hasStock(10)).toBe(true);
    });

    it("should return false when product has insufficient stock", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(5),
      });

      expect(product.hasStock(6)).toBe(false);
      expect(product.hasStock(10)).toBe(false);
    });

    it("should return true when checking for 0 quantity", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(10),
      });

      expect(product.hasStock(0)).toBe(true);
    });

    it("should use default quantity of 1 when no quantity specified", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(1),
      });

      expect(product.hasStock()).toBe(true);
    });

    it("should return false when product has no stock", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(0),
      });

      expect(product.hasStock(1)).toBe(false);
      expect(product.hasStock(0)).toBe(true);
    });
  });
});
