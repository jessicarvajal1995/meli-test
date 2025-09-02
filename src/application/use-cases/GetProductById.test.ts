import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetProductById } from "./GetProductById";
import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";
import { ProductNotFoundError } from "@/domain/errors/ProductNotFoundError";

describe("GetProductById", () => {
  let getProductById: GetProductById;
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
      findById: vi.fn(),
    } as any;

    getProductById = new GetProductById(mockRepository);
  });

  describe("execute", () => {
    it("should return product when found", async () => {
      const productId = "ABC123456";
      const mockProduct = createMockProduct();

      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await getProductById.execute(productId);

      expect(mockRepository.findById).toHaveBeenCalledWith(
        ProductId.fromString(productId),
      );
      expect(result).toEqual(mockProduct);
    });

    it("should throw ProductNotFoundError when product not found", async () => {
      const productId = "ABC123456";

      mockRepository.findById.mockResolvedValue(null);

      await expect(getProductById.execute(productId)).rejects.toThrow(
        ProductNotFoundError,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(
        ProductId.fromString(productId),
      );
    });

    it("should throw ProductNotFoundError when repository returns undefined", async () => {
      const productId = "ABC123456";

      mockRepository.findById.mockResolvedValue(undefined);

      await expect(getProductById.execute(productId)).rejects.toThrow(
        ProductNotFoundError,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(
        ProductId.fromString(productId),
      );
    });
  });
});
