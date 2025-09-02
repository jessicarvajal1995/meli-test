import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductNotFoundError } from "@/domain/errors/ProductNotFoundError";

export class GetProductById {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(productId: string): Promise<Product> {
    const id = ProductId.fromString(productId);

    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(`Product with ID ${productId} not found`);
    }

    return product;
  }
}
