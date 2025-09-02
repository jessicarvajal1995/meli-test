import { ProductId } from "@/domain/value-objects/ProductId";
import { Price } from "@/domain/value-objects/Price";
import { ProductStatus } from "@/domain/value-objects/ProductStatus";
import { ProductStock } from "@/domain/value-objects/ProductStock";

export class Product {
  constructor(
    public readonly id: ProductId,
    public readonly title: string,
    public readonly description: string,
    public readonly price: Price,
    public readonly categoryId: string,
    public readonly status: ProductStatus,
    public readonly stock: ProductStock,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public isAvailable(): boolean {
    return this.status.isActive() && this.stock.isAvailable();
  }

  public hasStock(quantity: number = 1): boolean {
    return this.stock.hasStock(quantity);
  }
}
