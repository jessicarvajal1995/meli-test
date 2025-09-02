import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import { ProductController } from "./ProductController";
import { ProductNotFoundError } from "@/domain/errors/ProductNotFoundError";
import { InvalidSearchParamsError } from "@/domain/errors/InvalidSearchParamsError";
import { RepositoryError } from "@/domain/errors/RepositoryError";
import { ProductDetailDto } from "@/adapters/dtos/ProductDto";
import { SearchProductsResponseDto, SearchProductsParamsDto } from "@/adapters/dtos/SearchProductsDto";

interface MockFastifyReply {
  code: MockedFunction<(code: number) => MockFastifyReply>;
  send: MockedFunction<(data: any) => void>;
}

interface MockFastifyRequest<T = any> {
  params?: T;
  query?: T;
}

type MockProductService = {
  getProductDetail: MockedFunction<(productId: string) => Promise<ProductDetailDto>>;
  searchProducts: MockedFunction<(params: SearchProductsParamsDto) => Promise<SearchProductsResponseDto>>;
  getRelatedProducts: MockedFunction<(productId: string, limit?: number) => Promise<SearchProductsResponseDto>>;
};

function createMockReply(): MockFastifyReply {
  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };
  return mockReply;
}

describe("ProductController", () => {
  let productController: ProductController;
  let mockProductService: MockProductService;
  let mockReply: MockFastifyReply;

  beforeEach(() => {
    mockProductService = {
      getProductDetail: vi.fn(),
      searchProducts: vi.fn(),
      getRelatedProducts: vi.fn(),
    };

    productController = new ProductController(mockProductService as any);
    mockReply = createMockReply();
  });

  describe("getProductDetail", () => {
    it("should return product detail successfully", async () => {
      const mockProduct = {
        id: "123",
        title: "Test Product",
        description: "Test Description",
        price: { amount: 100, currency: "USD" },
        categoryId: "cat1",
        status: "active",
        stock: { quantity: 10, isAvailable: true },
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        isAvailable: true,
      };

      const mockRequest = {
        params: { id: "123" },
      } as MockFastifyRequest<{ id: string }>;

      mockProductService.getProductDetail.mockResolvedValue(mockProduct);

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockProductService.getProductDetail).toHaveBeenCalledWith("123");
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: mockProduct,
        statusCode: 200,
      });
    });

    it("should return 400 when product ID is empty", async () => {
      const mockRequest = {
        params: { id: "" },
      } as MockFastifyRequest<{ id: string }>;

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Product ID is required",
        statusCode: 400,
      });
      expect(mockProductService.getProductDetail).not.toHaveBeenCalled();
    });

    it("should return 400 when product ID is whitespace", async () => {
      const mockRequest = {
        params: { id: "   " },
      } as MockFastifyRequest<{ id: string }>;

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Product ID is required",
        statusCode: 400,
      });
      expect(mockProductService.getProductDetail).not.toHaveBeenCalled();
    });

    it("should return 404 when ProductNotFoundError is thrown", async () => {
      const mockRequest = {
        params: { id: "nonexistent" },
      } as MockFastifyRequest<{ id: string }>;

      mockProductService.getProductDetail.mockRejectedValue(
        new ProductNotFoundError("Product not found")
      );

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Not Found",
        message: "Product not found",
        statusCode: 404,
      });
    });

    it("should return 400 when InvalidSearchParamsError is thrown", async () => {
      const mockRequest = {
        params: { id: "123" },
      } as MockFastifyRequest<{ id: string }>;

      mockProductService.getProductDetail.mockRejectedValue(
        new InvalidSearchParamsError("Invalid parameters")
      );

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Invalid parameters",
        statusCode: 400,
      });
    });

    it("should return 500 when RepositoryError is thrown", async () => {
      const mockRequest = {
        params: { id: "123" },
      } as MockFastifyRequest<{ id: string }>;

      mockProductService.getProductDetail.mockRejectedValue(
        new RepositoryError("Database error")
      );

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "An error occurred while processing your request",
        statusCode: 500,
      });
    });

    it("should return 500 for unexpected errors", async () => {
      const mockRequest = {
        params: { id: "123" },
      } as MockFastifyRequest<{ id: string }>;

      mockProductService.getProductDetail.mockRejectedValue(
        new Error("Unexpected error")
      );

      await productController.getProductDetail(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        statusCode: 500,
      });
    });
  });

  describe("searchProducts", () => {
    it("should search products successfully with all parameters", async () => {
      const mockResult = {
        products: [],
        pagination: {
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      };

      const mockRequest = {
        query: {
          categoryId: "cat1",
          limit: "10",
          offset: "0",
        },
      } as MockFastifyRequest<{ categoryId?: string; limit?: string; offset?: string }>;

      mockProductService.searchProducts.mockResolvedValue(mockResult);

      await productController.searchProducts(mockRequest as any, mockReply as any);

      expect(mockProductService.searchProducts).toHaveBeenCalledWith({
        categoryId: "cat1",
        limit: 10,
        offset: 0,
      });
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: mockResult,
        statusCode: 200,
      });
    });

    it("should search products successfully with partial parameters", async () => {
      const mockResult = {
        products: [],
        pagination: {
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      };

      const mockRequest = {
        query: {
          categoryId: "cat1",
        },
      } as MockFastifyRequest<{ categoryId?: string; limit?: string; offset?: string }>;

      mockProductService.searchProducts.mockResolvedValue(mockResult);

      await productController.searchProducts(mockRequest as any, mockReply as any);

      expect(mockProductService.searchProducts).toHaveBeenCalledWith({
        categoryId: "cat1",
      });
      expect(mockReply.code).toHaveBeenCalledWith(200);
    });

    it("should handle search errors", async () => {
      const mockRequest = {
        query: {},
      } as MockFastifyRequest<{ categoryId?: string; limit?: string; offset?: string }>;

      mockProductService.searchProducts.mockRejectedValue(
        new RepositoryError("Search failed")
      );

      await productController.searchProducts(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "An error occurred while processing your request",
        statusCode: 500,
      });
    });
  });

  describe("getRelatedProducts", () => {
    it("should return related products successfully", async () => {
      const mockResult = {
        products: [],
        pagination: {
          total: 0,
          limit: 4,
          offset: 0,
          hasMore: false,
        },
      };

      const mockRequest = {
        params: { id: "123" },
        query: { limit: "5" },
      } as any;

      mockProductService.getRelatedProducts.mockResolvedValue(mockResult);

      await productController.getRelatedProducts(mockRequest as any, mockReply as any);

      expect(mockProductService.getRelatedProducts).toHaveBeenCalledWith("123", 5);
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: mockResult,
        statusCode: 200,
      });
    });

    it("should use default limit of 4 when not provided", async () => {
      const mockResult = {
        products: [],
        pagination: {
          total: 0,
          limit: 4,
          offset: 0,
          hasMore: false,
        },
      };

      const mockRequest = {
        params: { id: "123" },
        query: {},
      } as any;

      mockProductService.getRelatedProducts.mockResolvedValue(mockResult);

      await productController.getRelatedProducts(mockRequest as any, mockReply as any);

      expect(mockProductService.getRelatedProducts).toHaveBeenCalledWith("123", 4);
      expect(mockReply.code).toHaveBeenCalledWith(200);
    });

    it("should return 400 when product ID is empty", async () => {
      const mockRequest = {
        params: { id: "" },
        query: {},
      } as any;

      await productController.getRelatedProducts(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Product ID is required",
        statusCode: 400,
      });
      expect(mockProductService.getRelatedProducts).not.toHaveBeenCalled();
    });

    it("should return 400 when limit is less than 1", async () => {
      const mockRequest = {
        params: { id: "123" },
        query: { limit: "0" },
      } as any;

      await productController.getRelatedProducts(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Limit must be between 1 and 20",
        statusCode: 400,
      });
      expect(mockProductService.getRelatedProducts).not.toHaveBeenCalled();
    });

    it("should return 400 when limit is greater than 20", async () => {
      const mockRequest = {
        params: { id: "123" },
        query: { limit: "25" },
      } as any;

      await productController.getRelatedProducts(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Limit must be between 1 and 20",
        statusCode: 400,
      });
      expect(mockProductService.getRelatedProducts).not.toHaveBeenCalled();
    });

    it("should handle related products errors", async () => {
      const mockRequest = {
        params: { id: "123" },
        query: {},
      } as any;

      mockProductService.getRelatedProducts.mockRejectedValue(
        new ProductNotFoundError("Product not found")
      );

      await productController.getRelatedProducts(mockRequest as any, mockReply as any);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Not Found",
        message: "Product not found",
        statusCode: 404,
      });
    });
  });
});
