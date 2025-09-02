import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchProducts } from "./SearchProducts";
import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";
import { InvalidSearchParamsError } from "@/domain/errors/InvalidSearchParamsError";

describe("SearchProducts", () => {
  let searchProducts: SearchProducts;
  let mockRepository: any;

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

  beforeEach(() => {
    mockRepository = {
      findByCategory: vi.fn(),
      findAll: vi.fn(),
    } as any;

    searchProducts = new SearchProducts(mockRepository);
  });

  describe("execute", () => {
    it("should return search results with category filter", async () => {
      const searchParams = {
        categoryId: "cat-1",
        limit: 10,
        offset: 0,
      };

      const mockResults = [
        createMockProduct({ id: ProductId.fromString("ABC123456") }),
        createMockProduct({ id: ProductId.fromString("DEF123456") }),
      ];

      mockRepository.findByCategory.mockResolvedValue(mockResults);

      const result = await searchProducts.execute(searchParams);

      expect(mockRepository.findByCategory).toHaveBeenCalledWith("cat-1", 11, 0);
      expect(result.products).toHaveLength(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("should return search results without category filter", async () => {
      const searchParams = {
        limit: 10,
        offset: 0,
      };

      const mockResults = [
        createMockProduct({ id: ProductId.fromString("ABC123456") }),
        createMockProduct({ id: ProductId.fromString("DEF123456") }),
      ];

      mockRepository.findAll.mockResolvedValue(mockResults);

      const result = await searchProducts.execute(searchParams);

      expect(mockRepository.findAll).toHaveBeenCalledWith(11, 0);
      expect(result.products).toHaveLength(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("should return empty array when no results found", async () => {
      const searchParams = {
        limit: 10,
        offset: 0,
      };

      mockRepository.findAll.mockResolvedValue([]);

      const result = await searchProducts.execute(searchParams);

      expect(mockRepository.findAll).toHaveBeenCalledWith(11, 0);
      expect(result.products).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it("should indicate hasMore when more results are available", async () => {
      const searchParams = {
        limit: 2,
        offset: 0,
      };

      const mockResults = [
        createMockProduct({ id: ProductId.fromString("ABC123456") }),
        createMockProduct({ id: ProductId.fromString("DEF123456") }),
        createMockProduct({ id: ProductId.fromString("GHI123456") }),
      ];

      mockRepository.findAll.mockResolvedValue(mockResults);

      const result = await searchProducts.execute(searchParams);

      expect(result.products).toHaveLength(2);
      expect(result.hasMore).toBe(true);
    });

    it("should throw InvalidSearchParamsError for negative limit", async () => {
      const searchParams = {
        limit: -1,
        offset: 0,
      };

      await expect(searchProducts.execute(searchParams)).rejects.toThrow(
        InvalidSearchParamsError,
      );
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockRepository.findByCategory).not.toHaveBeenCalled();
    });

    it("should throw InvalidSearchParamsError for zero limit", async () => {
      const searchParams = {
        limit: 0,
        offset: 0,
      };

      await expect(searchProducts.execute(searchParams)).rejects.toThrow(
        InvalidSearchParamsError,
      );
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockRepository.findByCategory).not.toHaveBeenCalled();
    });

    it("should throw InvalidSearchParamsError for limit greater than 100", async () => {
      const searchParams = {
        limit: 101,
        offset: 0,
      };

      await expect(searchProducts.execute(searchParams)).rejects.toThrow(
        InvalidSearchParamsError,
      );
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockRepository.findByCategory).not.toHaveBeenCalled();
    });

    it("should throw InvalidSearchParamsError for negative offset", async () => {
      const searchParams = {
        limit: 10,
        offset: -1,
      };

      await expect(searchProducts.execute(searchParams)).rejects.toThrow(
        InvalidSearchParamsError,
      );
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockRepository.findByCategory).not.toHaveBeenCalled();
    });

    it("should use default values when optional parameters are not provided", async () => {
      const searchParams = {};

      const mockResults = [createMockProduct()];
      mockRepository.findAll.mockResolvedValue(mockResults);

      const result = await searchProducts.execute(searchParams);

      expect(mockRepository.findAll).toHaveBeenCalledWith(21, 0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.products).toEqual(mockResults);
    });

    it("should filter out unavailable products", async () => {
      const searchParams = {
        limit: 10,
        offset: 0,
      };

      const availableProduct = createMockProduct({
        status: ProductStatus.fromString("active"),
        stock: ProductStock.fromNumber(5),
      });
      const unavailableProduct = createMockProduct({
        status: ProductStatus.fromString("inactive"),
        stock: ProductStock.fromNumber(10),
      });

      mockRepository.findAll.mockResolvedValue([availableProduct, unavailableProduct]);

      const result = await searchProducts.execute(searchParams);

      expect(result.products).toHaveLength(1);
      expect(result.products[0]).toEqual(availableProduct);
    });
  });
});
