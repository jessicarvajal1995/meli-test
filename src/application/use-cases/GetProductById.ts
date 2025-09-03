import { Product } from "@/domain/entities/Product";
import { ProductId } from "@/domain/value-objects/ProductId";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductNotFoundError } from "@/domain/errors/ProductNotFoundError";
// Caso de uso para obtener un producto por su id.
export class GetProductById {
  // Constructor de la clase.
  constructor(private readonly productRepository: ProductRepository) {}
  // Metodo para ejecutar la logica del negocio.
  async execute(productId: string): Promise<Product> {
    // Convierte el id a un objeto ProductId.
    const id = ProductId.fromString(productId);
    // Busca el producto por su id.
    const product = await this.productRepository.findById(id);
    if (!product) {
      // Lanza un error si el producto no existe.
      throw new ProductNotFoundError(`Product with ID ${productId} not found`);
    }
    // Retorna el producto.
    return product;
  }
}
