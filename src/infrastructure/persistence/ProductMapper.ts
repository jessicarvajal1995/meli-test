import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";

export interface ProductJsonData {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    originalAmount?: number;
  };
  categoryId: string;
  status: string;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export class ProductMapper {
  static toDomain(jsonData: ProductJsonData): Product {
    try {
      const id = ProductId.fromString(jsonData.id);
      const price = new Price(
        jsonData.price.amount,
        jsonData.price.currency,
        jsonData.price.originalAmount,
      );
      const status = ProductStatus.fromString(jsonData.status);
      const stock = ProductStock.fromNumber(jsonData.availableQuantity);
      const createdAt = new Date(jsonData.createdAt);
      const updatedAt = new Date(jsonData.updatedAt);

      return new Product(
        id,
        jsonData.title,
        jsonData.description,
        price,
        jsonData.categoryId,
        status,
        stock,
        createdAt,
        updatedAt,
      );
    } catch (error) {
      throw new Error(
        `Error mapping product from JSON: ${(error as Error).message}`,
      );
    }
  }

  static toJson(product: Product): ProductJsonData {
    try {
      const originalAmount = product.price.getOriginalAmount();
      const basePrice = {
        amount: product.price.getAmount(),
        currency: product.price.getCurrency(),
      };

      const priceWithOptional =
        originalAmount !== undefined
          ? { ...basePrice, originalAmount }
          : basePrice;

      return {
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        price: priceWithOptional,
        categoryId: product.categoryId,
        status: product.status.toString(),
        availableQuantity: product.stock.getValue(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Error mapping product to JSON: ${(error as Error).message}`,
      );
    }
  }

  static validateJsonData(data: any): data is ProductJsonData {
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.id === "string" &&
      typeof data.title === "string" &&
      typeof data.description === "string" &&
      typeof data.price === "object" &&
      typeof data.price.amount === "number" &&
      typeof data.price.currency === "string" &&
      typeof data.categoryId === "string" &&
      typeof data.status === "string" &&
      typeof data.availableQuantity === "number" &&
      typeof data.createdAt === "string" &&
      typeof data.updatedAt === "string"
    );
  }
}
