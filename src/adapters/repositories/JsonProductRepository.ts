import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { FileUtils } from "@/infrastructure/persistence/FileUtils";
import {
  ProductMapper,
  ProductJsonData,
} from "@/infrastructure/persistence/ProductMapper";
import {
  ProductNotFoundError,
  RepositoryError,
  DataIntegrityError,
} from "@/domain/errors/RepositoryError";
import { FileOperationError } from "@/infrastructure/errors/FileOperationError";

export class JsonProductRepository implements ProductRepository {
  private static readonly PRODUCTS_FILE = "products.json";
  private productsCache: Map<string, Product> = new Map();

  async findById(id: ProductId): Promise<Product | null> {
    try {
      await this.ensureCacheIsUpdated();
      return this.productsCache.get(id.toString()) || null;
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError(
          `Error finding product by ID ${id.toString()}`,
          error,
        );
      }
      throw new RepositoryError(
        `Error finding product by ID ${id.toString()}`,
        error as Error,
      );
    }
  }

  async findByCategory(
    categoryId: string,
    limit?: number,
    offset = 0,
  ): Promise<Product[]> {
    try {
      await this.ensureCacheIsUpdated();

      const products = Array.from(this.productsCache.values())
        .filter((product) => product.categoryId === categoryId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(offset, limit ? offset + limit : undefined);

      return products;
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError(
          `Error finding products by category ${categoryId}`,
          error,
        );
      }
      throw new RepositoryError(
        `Error finding products by category ${categoryId}`,
        error as Error,
      );
    }
  }

  async findAll(limit?: number, offset = 0): Promise<Product[]> {
    try {
      await this.ensureCacheIsUpdated();

      const products = Array.from(this.productsCache.values())
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(offset, limit ? offset + limit : undefined);

      return products;
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError("Error finding all products", error);
      }
      throw new RepositoryError("Error finding all products", error as Error);
    }
  }

  async save(product: Product): Promise<Product> {
    try {
      await this.ensureCacheIsUpdated();

      await FileUtils.backupFile(JsonProductRepository.PRODUCTS_FILE);

      this.productsCache.set(product.id.toString(), product);

      await this.persistCache();

      return product;
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError(
          `Error saving product ${product.id.toString()}`,
          error,
        );
      }
      throw new RepositoryError(
        `Error saving product ${product.id.toString()}`,
        error as Error,
      );
    }
  }

  async delete(id: ProductId): Promise<void> {
    try {
      await this.ensureCacheIsUpdated();

      if (!this.productsCache.has(id.toString())) {
        throw new ProductNotFoundError(
          `Product with ID ${id.toString()} not found`,
        );
      }

      await FileUtils.backupFile(JsonProductRepository.PRODUCTS_FILE);

      this.productsCache.delete(id.toString());

      await this.persistCache();
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      if (error instanceof FileOperationError) {
        throw new RepositoryError(
          `Error deleting product ${id.toString()}`,
          error,
        );
      }
      throw new RepositoryError(
        `Error deleting product ${id.toString()}`,
        error as Error,
      );
    }
  }

  async exists(id: ProductId): Promise<boolean> {
    try {
      await this.ensureCacheIsUpdated();
      return this.productsCache.has(id.toString());
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError(
          `Error checking if product ${id.toString()} exists`,
          error,
        );
      }
      throw new RepositoryError(
        `Error checking if product ${id.toString()} exists`,
        error as Error,
      );
    }
  }

  private async ensureCacheIsUpdated(): Promise<void> {
    try {
      if (this.productsCache.size === 0) {
        await this.loadProductsFromFile();
      }
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError("Error updating cache", error);
      }
      throw new RepositoryError("Error updating cache", error as Error);
    }
  }

  private async loadProductsFromFile(): Promise<void> {
    try {
      const jsonData = await FileUtils.readJsonFile<ProductJsonData>(
        JsonProductRepository.PRODUCTS_FILE,
      );

      this.productsCache.clear();

      for (const item of jsonData) {
        if (!ProductMapper.validateJsonData(item)) {
          continue;
        }

        try {
          const product = ProductMapper.toDomain(item);
          this.productsCache.set(product.id.toString(), product);
        } catch {
          continue;
        }
      }
    } catch (error) {
      throw new DataIntegrityError(
        `Error loading products from file: ${(error as Error).message}`,
      );
    }
  }

  private async persistCache(): Promise<void> {
    try {
      const jsonData = Array.from(this.productsCache.values()).map((product) =>
        ProductMapper.toJson(product),
      );

      await FileUtils.writeJsonFile(
        JsonProductRepository.PRODUCTS_FILE,
        jsonData,
      );
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw new RepositoryError("Error persisting products to file", error);
      }
      throw new RepositoryError(
        "Error persisting products to file",
        error as Error,
      );
    }
  }

  clearCache(): void {
    this.productsCache.clear();
  }
}
