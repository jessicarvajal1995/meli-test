import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";

export interface ProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByCategory(
    categoryId: string,
    limit?: number,
    offset?: number,
  ): Promise<Product[]>;
  findAll(limit?: number, offset?: number): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: ProductId): Promise<void>;
  exists(id: ProductId): Promise<boolean>;
}
