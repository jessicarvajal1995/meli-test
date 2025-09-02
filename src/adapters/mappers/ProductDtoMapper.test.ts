import { describe, it, expect } from "vitest";
import { ProductDtoMapper } from "./ProductDtoMapper";
import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";

describe("ProductDtoMapper", () => {
  const createMockProduct = (overrides: Partial<Product> = {}): Product => {
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

  describe("toDto", () => {
    it("should map Product to ProductDto correctly", () => {
      const product = createMockProduct();

      const result = ProductDtoMapper.toDto(product);

      expect(result).toEqual({
        id: "ABC123456",
        title: "Test Product",
        description: "Test Description",
        price: {
          amount: 1000,
          currency: "USD",
        },
        categoryId: "cat-1",
        status: "active",
        stock: {
          quantity: 10,
          isAvailable: true,
        },
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
        isAvailable: true,
      });
    });

    it("should handle inactive product status", () => {
      const product = createMockProduct({
        status: ProductStatus.fromString("inactive"),
      });

      const result = ProductDtoMapper.toDto(product);

      expect(result.status).toBe("inactive");
      expect(result.isAvailable).toBe(false);
    });

    it("should handle zero stock", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(0),
      });

      const result = ProductDtoMapper.toDto(product);

      expect(result.stock.quantity).toBe(0);
      expect(result.stock.isAvailable).toBe(false);
      expect(result.isAvailable).toBe(false);
    });

    it("should handle low stock", () => {
      const product = createMockProduct({
        stock: ProductStock.fromNumber(5),
      });

      const result = ProductDtoMapper.toDto(product);

      expect(result.stock.quantity).toBe(5);
      expect(result.stock.isAvailable).toBe(true);
      expect(result.isAvailable).toBe(true);
    });
  });

  describe("toDetailDto", () => {
    it("should return the same result as toDto", () => {
      const product = createMockProduct();

      const detailResult = ProductDtoMapper.toDetailDto(product);
      const dtoResult = ProductDtoMapper.toDto(product);

      expect(detailResult).toEqual(dtoResult);
    });
  });

  describe("toSearchResponseDto", () => {
    it("should map SearchProductsResponse to SearchProductsResponseDto", () => {
      const product1 = createMockProduct({
        id: ProductId.fromString("ABC123456"),
        title: "Product 1",
      });
      const product2 = createMockProduct({
        id: ProductId.fromString("DEF123456"),
        title: "Product 2",
      });

      const searchResponse: any = {
        products: [product1, product2],
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const result = ProductDtoMapper.toSearchResponseDto(searchResponse);

      expect(result.products).toHaveLength(2);
      expect(result.products[0]).toEqual({
        id: "ABC123456",
        title: "Product 1",
        description: "Test Description",
        price: {
          amount: 1000,
          currency: "USD",
        },
        categoryId: "cat-1",
        status: "active",
        stock: {
          quantity: 10,
          isAvailable: true,
        },
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
        isAvailable: true,
      });
      expect(result.products[1]).toEqual({
        id: "DEF123456",
        title: "Product 2",
        description: "Test Description",
        price: {
          amount: 1000,
          currency: "USD",
        },
        categoryId: "cat-1",
        status: "active",
        stock: {
          quantity: 10,
          isAvailable: true,
        },
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
        isAvailable: true,
      });
      expect(result.pagination).toEqual({
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    });

    it("should handle empty products list", () => {
      const searchResponse: any = {
        products: [],
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const result = ProductDtoMapper.toSearchResponseDto(searchResponse);

      expect(result.products).toHaveLength(0);
      expect(result.pagination).toEqual({
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    });

    it("should handle pagination with hasMore true", () => {
      const product = createMockProduct();
      const searchResponse: any = {
        products: [product],
        limit: 10,
        offset: 0,
        hasMore: true,
      };

      const result = ProductDtoMapper.toSearchResponseDto(searchResponse);

      expect(result.pagination.hasMore).toBe(true);
    });

    it("should handle pagination with offset", () => {
      const product = createMockProduct();
      const searchResponse: any = {
        products: [product],
        limit: 10,
        offset: 10,
        hasMore: true,
      };

      const result = ProductDtoMapper.toSearchResponseDto(searchResponse);

      expect(result.pagination.offset).toBe(10);
      expect(result.pagination.limit).toBe(10);
    });
  });
});
