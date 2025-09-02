import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest";
import { JsonProductRepository } from "./JsonProductRepository";
import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";
import { FileUtils } from "@/infrastructure/persistence/FileUtils";
import { ProductMapper, ProductJsonData } from "@/infrastructure/persistence/ProductMapper";
import { ProductNotFoundError, RepositoryError } from "@/domain/errors/RepositoryError";
import { FileOperationError } from "@/infrastructure/errors/FileOperationError";


vi.mock("@/infrastructure/persistence/FileUtils", () => ({
  FileUtils: {
    readJsonFile: vi.fn(),
    writeJsonFile: vi.fn(),
    backupFile: vi.fn(),
  },
}));


vi.mock("@/infrastructure/persistence/ProductMapper", () => ({
  ProductMapper: {
    toDomain: vi.fn(),
    toJson: vi.fn(),
    validateJsonData: vi.fn(),
  },
}));

type MockFileUtils = {
  readJsonFile: MockedFunction<<T>(filename: string) => Promise<T[]>>;
  writeJsonFile: MockedFunction<<T>(filename: string, data: T[]) => Promise<void>>;
  backupFile: MockedFunction<(filename: string) => Promise<void>>;
};

type MockProductMapper = {
  toDomain: MockedFunction<(jsonData: ProductJsonData) => Product>;
  toJson: MockedFunction<(product: Product) => ProductJsonData>;
  validateJsonData: MockedFunction<(data: any) => data is ProductJsonData>;
};

describe("JsonProductRepository", () => {
  let repository: JsonProductRepository;
  let mockFileUtils: MockFileUtils;
  let mockProductMapper: MockProductMapper;

  
  const mockProductId = ProductId.fromString("550e8400-e29b-41d4-a716-446655440000");
  const mockPrice = new Price(100, "USD");
  const mockStatus = ProductStatus.fromString("active");
  const mockStock = ProductStock.fromNumber(10);
  const mockCreatedAt = new Date("2023-01-01");
  const mockUpdatedAt = new Date("2023-01-01");

  const mockProduct = new Product(
    mockProductId,
    "Test Product",
    "Test Description",
    mockPrice,
    "cat1",
    mockStatus,
    mockStock,
    mockCreatedAt,
    mockUpdatedAt
  );

  const mockJsonData: ProductJsonData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Test Product",
    description: "Test Description",
    price: { amount: 100, currency: "USD" },
    categoryId: "cat1",
    status: "active",
    availableQuantity: 10,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  
  const mockProductId2 = ProductId.fromString("550e8400-e29b-41d4-a716-446655440001");
  const mockProduct2 = new Product(
    mockProductId2,
    "Test Product 2",
    "Test Description 2",
    mockPrice,
    "cat1",
    mockStatus,
    mockStock,
    mockCreatedAt,
    new Date("2023-01-02")
  );



  const mockProductId3 = ProductId.fromString("550e8400-e29b-41d4-a716-446655440002");
  const mockProduct3 = new Product(
    mockProductId3,
    "Test Product 3",
    "Test Description 3",
    mockPrice,
    "cat2",
    mockStatus,
    mockStock,
    mockCreatedAt,
    new Date("2023-01-03")
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileUtils = FileUtils as any;
    mockProductMapper = ProductMapper as any;
    repository = new JsonProductRepository();

    mockProductMapper.toDomain.mockReturnValue(mockProduct);
    mockProductMapper.toJson.mockReturnValue(mockJsonData);
    mockProductMapper.validateJsonData.mockReturnValue(true);
  });

  afterEach(() => {
    repository.clearCache();
  });

  describe("findById", () => {
    it("should return product when found in cache", async () => {
      
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);

      const result = await repository.findById(mockProductId);

      expect(result).toBe(mockProduct);
      expect(mockFileUtils.readJsonFile).not.toHaveBeenCalled();
    });

    it("should load from file and return product when not in cache", async () => {
      mockFileUtils.readJsonFile.mockResolvedValue([mockJsonData]);

      const result = await repository.findById(mockProductId);

      expect(result).toBe(mockProduct);
      expect(mockFileUtils.readJsonFile).toHaveBeenCalledWith("products.json");
      expect(mockProductMapper.validateJsonData).toHaveBeenCalledWith(mockJsonData);
      expect(mockProductMapper.toDomain).toHaveBeenCalledWith(mockJsonData);
    });

    it("should return null when product not found", async () => {
      mockFileUtils.readJsonFile.mockResolvedValue([]);

      const result = await repository.findById(mockProductId);

      expect(result).toBeNull();
    });

    it("should throw RepositoryError when FileOperationError occurs", async () => {
      const fileError = new FileOperationError("File read error");
      mockFileUtils.readJsonFile.mockRejectedValue(fileError);

      await expect(repository.findById(mockProductId)).rejects.toThrow(RepositoryError);
    });

    it("should throw RepositoryError for other errors", async () => {
      mockFileUtils.readJsonFile.mockRejectedValue(new Error("Generic error"));

      await expect(repository.findById(mockProductId)).rejects.toThrow(RepositoryError);
    });

    it("should skip invalid products during loading", async () => {
      const invalidJsonData = { invalid: "data" };
      mockFileUtils.readJsonFile.mockResolvedValue([invalidJsonData, mockJsonData]);
      mockProductMapper.validateJsonData.mockImplementation((data: any) => data === mockJsonData);

      const result = await repository.findById(mockProductId);

      expect(result).toBe(mockProduct);
      expect(mockProductMapper.toDomain).toHaveBeenCalledTimes(1);
      expect(mockProductMapper.toDomain).toHaveBeenCalledWith(mockJsonData);
    });
  });

  describe("findByCategory", () => {

    it("should return products filtered by category", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440001", mockProduct2);
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440002", mockProduct3);

      const result = await repository.findByCategory("cat1");

      expect(result).toHaveLength(2);
      expect(result[0].id.toString()).toBe("550e8400-e29b-41d4-a716-446655440001"); 
      expect(result[1].id.toString()).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should apply limit and offset", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440001", mockProduct2);

      const result = await repository.findByCategory("cat1", 1, 1);

      expect(result).toHaveLength(1);
      expect(result[0].id.toString()).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should handle empty results", async () => {
      const result = await repository.findByCategory("nonexistent");

      expect(result).toHaveLength(0);
    });

    it("should throw RepositoryError when FileOperationError occurs", async () => {
      const fileError = new FileOperationError("File read error");
      mockFileUtils.readJsonFile.mockRejectedValue(fileError);

      await expect(repository.findByCategory("cat1")).rejects.toThrow(RepositoryError);
    });
  });

  describe("findAll", () => {
    it("should return all products sorted by updated date", async () => {
      const product1 = new Product(
        ProductId.fromString("550e8400-e29b-41d4-a716-446655440000"),
        "Product 1",
        "Description 1",
        mockPrice,
        "cat1",
        mockStatus,
        mockStock,
        mockCreatedAt,
        new Date("2023-01-01")
      );

      const product2 = new Product(
        ProductId.fromString("550e8400-e29b-41d4-a716-446655440001"),
        "Product 2",
        "Description 2",
        mockPrice,
        "cat1",
        mockStatus,
        mockStock,
        mockCreatedAt,
        new Date("2023-01-02")
      );

      repository["productsCache"].set("test-123", product1);
      repository["productsCache"].set("test-456", product2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id.toString()).toBe("550e8400-e29b-41d4-a716-446655440001"); 
      expect(result[1].id.toString()).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should apply limit and offset", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);
      repository["productsCache"].set("test-456", new Product(
        ProductId.fromString("550e8400-e29b-41d4-a716-446655440001"),
        "Product 2",
        "Description 2",
        mockPrice,
        "cat1",
        mockStatus,
        mockStock,
        mockCreatedAt,
        new Date("2023-01-02")
      ));

      const result = await repository.findAll(1, 1);

      expect(result).toHaveLength(1);
      expect(result[0].id.toString()).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });

  describe("save", () => {
    it("should save product successfully", async () => {
      mockFileUtils.readJsonFile.mockResolvedValue([]);
      mockFileUtils.writeJsonFile.mockResolvedValue();

      const result = await repository.save(mockProduct);

      expect(result).toBe(mockProduct);
      expect(mockFileUtils.backupFile).toHaveBeenCalledWith("products.json");
      expect(mockFileUtils.writeJsonFile).toHaveBeenCalledWith("products.json", [mockJsonData]);
      expect(repository["productsCache"].get("550e8400-e29b-41d4-a716-446655440000")).toBe(mockProduct);
    });

    it("should update existing product", async () => {
      const existingProduct = new Product(
        mockProductId,
        "Old Title",
        "Old Description",
        mockPrice,
        "cat1",
        mockStatus,
        mockStock,
        mockCreatedAt,
        mockUpdatedAt
      );

      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", existingProduct);
      mockFileUtils.writeJsonFile.mockResolvedValue();

      const result = await repository.save(mockProduct);

      expect(result).toBe(mockProduct);
      expect(repository["productsCache"].get("550e8400-e29b-41d4-a716-446655440000")).toBe(mockProduct);
    });

    it("should throw RepositoryError when backup fails", async () => {
      const fileError = new FileOperationError("Backup failed");
      mockFileUtils.backupFile.mockRejectedValue(fileError);

      await expect(repository.save(mockProduct)).rejects.toThrow(RepositoryError);
    });

    it("should throw RepositoryError when write fails", async () => {
      const fileError = new FileOperationError("Write failed");
      mockFileUtils.writeJsonFile.mockRejectedValue(fileError);
      mockFileUtils.backupFile.mockResolvedValue();

      await expect(repository.save(mockProduct)).rejects.toThrow(RepositoryError);
    });
  });

  describe("delete", () => {
    it("should delete existing product successfully", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);
      mockFileUtils.writeJsonFile.mockResolvedValue();

      await repository.delete(mockProductId);

      expect(repository["productsCache"].has("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
      expect(mockFileUtils.backupFile).toHaveBeenCalledWith("products.json");
      expect(mockFileUtils.writeJsonFile).toHaveBeenCalledWith("products.json", []);
    });

    it("should throw ProductNotFoundError when product doesn't exist", async () => {
      await expect(repository.delete(mockProductId)).rejects.toThrow(ProductNotFoundError);
    });

    it("should throw RepositoryError when backup fails", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);
      const fileError = new FileOperationError("Backup failed");
      mockFileUtils.backupFile.mockRejectedValue(fileError);

      await expect(repository.delete(mockProductId)).rejects.toThrow(RepositoryError);
    });

    it("should throw RepositoryError when write fails", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);
      const fileError = new FileOperationError("Write failed");
      mockFileUtils.writeJsonFile.mockRejectedValue(fileError);
      mockFileUtils.backupFile.mockResolvedValue();

      await expect(repository.delete(mockProductId)).rejects.toThrow(RepositoryError);
    });
  });

  describe("exists", () => {
    it("should return true when product exists", async () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);

      const result = await repository.exists(mockProductId);

      expect(result).toBe(true);
    });

    it("should return false when product doesn't exist", async () => {
      const result = await repository.exists(mockProductId);

      expect(result).toBe(false);
    });

    it("should throw RepositoryError when FileOperationError occurs", async () => {
      const fileError = new FileOperationError("File access error");
      mockFileUtils.readJsonFile.mockRejectedValue(fileError);

      await expect(repository.exists(mockProductId)).rejects.toThrow(RepositoryError);
    });
  });

  describe("cache management", () => {
    it("should clear cache when clearCache is called", () => {
      repository["productsCache"].set("550e8400-e29b-41d4-a716-446655440000", mockProduct);

      repository.clearCache();

      expect(repository["productsCache"].size).toBe(0);
    });

    it("should load products from file when cache is empty", async () => {
      mockFileUtils.readJsonFile.mockResolvedValue([mockJsonData]);

      await repository.findById(mockProductId);

      expect(mockFileUtils.readJsonFile).toHaveBeenCalledWith("products.json");
      expect(repository["productsCache"].has("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle ProductMapper.toDomain errors gracefully", async () => {
      const invalidJsonData: ProductJsonData = {
        id: "invalid",
        title: "Invalid Product",
        description: "Invalid Description",
        price: { amount: 100, currency: "USD" },
        categoryId: "cat1",
        status: "active",
        availableQuantity: 10,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      };
      mockFileUtils.readJsonFile.mockResolvedValue([invalidJsonData, mockJsonData]);
      mockProductMapper.validateJsonData.mockReturnValue(true);
      mockProductMapper.toDomain.mockImplementation((data: ProductJsonData) => {
        if (data.id === "invalid") {
          throw new Error("Mapping error");
        }
        return mockProduct;
      });

      const result = await repository.findById(mockProductId);

      expect(result).toBe(mockProduct);
      expect(mockProductMapper.toDomain).toHaveBeenCalledTimes(2);
    });

    it("should throw DataIntegrityError for file loading errors", async () => {
      mockFileUtils.readJsonFile.mockRejectedValue(new Error("Parse error"));

      await expect(repository.findById(mockProductId)).rejects.toThrow();
    });
  });
});
