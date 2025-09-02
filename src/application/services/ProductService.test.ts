import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "./ProductService";

import { Product } from "@/domain/entities/Product";
import { ProductDtoMapper } from "@/adapters/mappers/ProductDtoMapper";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";
import { ProductNotFoundError } from "@/domain/errors/ProductNotFoundError";
import { InvalidSearchParamsError } from "@/domain/errors/InvalidSearchParamsError";
import { RepositoryError } from "@/domain/errors/RepositoryError";

describe("ProductService", () => {
  let productService: ProductService;
  let mockGetProductById: any;
  let mockSearchProducts: any;

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
    mockGetProductById = {
      execute: vi.fn(),
    } as any;

    mockSearchProducts = {
      execute: vi.fn(),
    } as any;

    productService = new ProductService(mockGetProductById, mockSearchProducts);
  });

  describe("getProductDetail", () => {
    it("should return product detail successfully", async () => {
      const productId = "ABC123456";
      const mockProduct = createMockProduct();

      mockGetProductById.execute.mockResolvedValue(mockProduct);

      const result = await productService.getProductDetail(productId);

      expect(mockGetProductById.execute).toHaveBeenCalledWith(productId);
      expect(result).toEqual(ProductDtoMapper.toDetailDto(mockProduct));
    });

    it("should throw ProductNotFoundError when product is not found", async () => {
      const productId = "ABC123456";

      mockGetProductById.execute.mockRejectedValue(
        new ProductNotFoundError("Product not found"),
      );

      await expect(productService.getProductDetail(productId)).rejects.toThrow(
        ProductNotFoundError,
      );
      expect(mockGetProductById.execute).toHaveBeenCalledWith(productId);
    });

    it("should throw RepositoryError when repository fails", async () => {
      const productId = "ABC123456";

      mockGetProductById.execute.mockRejectedValue(
        new RepositoryError("Database error"),
      );

      await expect(productService.getProductDetail(productId)).rejects.toThrow(
        RepositoryError,
      );
      expect(mockGetProductById.execute).toHaveBeenCalledWith(productId);
    });

    it("should throw unexpected errors as-is", async () => {
      const productId = "ABC123456";
      const unexpectedError = new Error("Unexpected error");

      mockGetProductById.execute.mockRejectedValue(unexpectedError);

      await expect(productService.getProductDetail(productId)).rejects.toThrow(
        unexpectedError,
      );
      expect(mockGetProductById.execute).toHaveBeenCalledWith(productId);
    });
  });

  describe("searchProducts", () => {
    it("should return search results successfully", async () => {
      const searchParams = {
        query: "test",
        categoryId: "cat-1",
        limit: 10,
        offset: 0,
      };

      const mockProducts = [
        createMockProduct({
          id: ProductId.fromString("ABC123456"),
          title: "Test Product 1",
        }),
        createMockProduct({
          id: ProductId.fromString("DEF123456"),
          title: "Test Product 2",
        }),
        createMockProduct({
          id: ProductId.fromString("GHI123456"),
          title: "Test Product 3",
        }),
      ];

      const mockSearchResponse = {
        products: mockProducts,
        limit: searchParams.limit,
        offset: searchParams.offset,
        hasMore: false,
      } as any;

      mockSearchProducts.execute.mockResolvedValue(mockSearchResponse);

      const result = await productService.searchProducts(searchParams);

      expect(mockSearchProducts.execute).toHaveBeenCalledWith(searchParams);
      expect(result).toEqual(
        ProductDtoMapper.toSearchResponseDto(mockSearchResponse),
      );
    });

    it("should return empty array when no products found", async () => {
      const searchParams = {
        query: "nonexistent",
        limit: 10,
        offset: 0,
      };

      const emptySearchResponse = {
        products: [],
        limit: searchParams.limit,
        offset: searchParams.offset,
        hasMore: false,
      } as any;

      mockSearchProducts.execute.mockResolvedValue(emptySearchResponse);

      const result = await productService.searchProducts(searchParams);

      expect(mockSearchProducts.execute).toHaveBeenCalledWith(searchParams);
      expect(result).toEqual(
        ProductDtoMapper.toSearchResponseDto(emptySearchResponse),
      );
    });

    it("should throw InvalidSearchParamsError when search parameters are invalid", async () => {
      const searchParams = {
        query: "test",
        limit: -1,
        offset: 0,
      };

      mockSearchProducts.execute.mockRejectedValue(
        new InvalidSearchParamsError("Invalid limit parameter"),
      );

      await expect(productService.searchProducts(searchParams)).rejects.toThrow(
        InvalidSearchParamsError,
      );
      expect(mockSearchProducts.execute).toHaveBeenCalledWith(searchParams);
    });

    it("should throw RepositoryError when repository fails", async () => {
      const searchParams = {
        query: "test",
        limit: 10,
        offset: 0,
      };

      mockSearchProducts.execute.mockRejectedValue(
        new RepositoryError("Database error"),
      );

      await expect(productService.searchProducts(searchParams)).rejects.toThrow(
        RepositoryError,
      );
      expect(mockSearchProducts.execute).toHaveBeenCalledWith(searchParams);
    });

    it("should throw unexpected errors as-is", async () => {
      const searchParams = {
        query: "test",
        limit: 10,
        offset: 0,
      };
      const unexpectedError = new Error("Unexpected error");

      mockSearchProducts.execute.mockRejectedValue(unexpectedError);

      await expect(productService.searchProducts(searchParams)).rejects.toThrow(
        unexpectedError,
      );
      expect(mockSearchProducts.execute).toHaveBeenCalledWith(searchParams);
    });
  });

  describe("getRelatedProducts", () => {
    it("should return related products successfully", async () => {
      const productId = "ABC123456";
      const limit = 4;

      const original = createMockProduct({
        id: ProductId.fromString(productId),
      });
      mockGetProductById.execute.mockResolvedValue(original);

      const relatedProductsResponse = {
        products: [
          createMockProduct({
            id: ProductId.fromString("DEF123456"),
            title: "Related Product 1",
          }),
          createMockProduct({
            id: ProductId.fromString("GHI123456"),
            title: "Related Product 2",
          }),
          createMockProduct({
            id: ProductId.fromString("JKL123456"),
            title: "Related Product 3",
          }),
        ],
        total: 3,
        limit: limit + 1,
        offset: 0,
        hasMore: false,
      } as any;

      mockSearchProducts.execute.mockResolvedValue(relatedProductsResponse);

      const result = await productService.getRelatedProducts(productId, limit);

      expect(mockSearchProducts.execute).toHaveBeenCalledWith({
        categoryId: original.categoryId,
        limit: limit + 1,
      });
      expect(result.products).toEqual(
        relatedProductsResponse.products
          .slice(0, limit)
          .map((p: Product) => ProductDtoMapper.toDto(p)),
      );
    });

    it("should return empty array when no related products found", async () => {
      const productId = "ABC123456";
      const limit = 4;

      const original = createMockProduct({
        id: ProductId.fromString(productId),
      });
      mockGetProductById.execute.mockResolvedValue(original);

      const relatedProductsResponse = {
        products: [],
        total: 0,
        limit: limit + 1,
        offset: 0,
        hasMore: false,
      } as any;

      mockSearchProducts.execute.mockResolvedValue(relatedProductsResponse);

      const result = await productService.getRelatedProducts(productId, limit);

      expect(mockSearchProducts.execute).toHaveBeenCalledWith({
        categoryId: original.categoryId,
        limit: limit + 1,
      });
      expect(result.products).toEqual([]);
    });

    it("should throw RepositoryError when repository fails", async () => {
      const productId = "ABC123456";
      const limit = 4;

      const original = createMockProduct({
        id: ProductId.fromString(productId),
      });
      mockGetProductById.execute.mockResolvedValue(original);

      mockSearchProducts.execute.mockRejectedValue(
        new RepositoryError("Database error"),
      );

      await expect(
        productService.getRelatedProducts(productId, limit),
      ).rejects.toThrow(RepositoryError);
      expect(mockSearchProducts.execute).toHaveBeenCalledWith({
        categoryId: original.categoryId,
        limit: limit + 1,
      });
    });

    it("should throw unexpected errors as-is", async () => {
      const productId = "ABC123456";
      const limit = 4;
      const unexpectedError = new Error("Unexpected error");

      const original = createMockProduct({
        id: ProductId.fromString(productId),
      });
      mockGetProductById.execute.mockResolvedValue(original);

      mockSearchProducts.execute.mockRejectedValue(unexpectedError);

      await expect(
        productService.getRelatedProducts(productId, limit),
      ).rejects.toThrow(unexpectedError);
      expect(mockSearchProducts.execute).toHaveBeenCalledWith({
        categoryId: original.categoryId,
        limit: limit + 1,
      });
    });
  });
});
