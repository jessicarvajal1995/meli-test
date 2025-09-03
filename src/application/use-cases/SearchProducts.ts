// Importaciones de dominio.
import { Product } from "@/domain/entities/Product";
import { InvalidSearchParamsError } from "@/domain/errors/InvalidSearchParamsError";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
// Parametros para la busqueda de productos.
export interface SearchProductsParams {
  categoryId?: string;
  limit?: number;
  offset?: number;
}
// Respuesta para la busqueda de productos.
export interface SearchProductsResponse {
  products: Product[];
  limit: number;
  offset: number;
  hasMore: boolean;
}
// Caso de uso para la busqueda de productos.
export class SearchProducts {
  constructor(private readonly productRepository: ProductRepository) {}
  // Metodo para ejecutar la logica del negocio.
  async execute(params: SearchProductsParams): Promise<SearchProductsResponse> {
    this.validateParams(params);
    // Obtiene los parametros de la busqueda.
    const { categoryId, limit = 20, offset = 0 } = params;

    // Busca los productos.
    const products = !categoryId
      ? await this.productRepository.findAll(limit + 1, offset)
      : await this.productRepository.findByCategory(
          categoryId,
          limit + 1,
          offset
        );

    // Filtro los productos que estan activos y disponibles
    const availableProducts = products.filter(product => product.isAvailable());
    // Retorna la respuesta.
    return {
      products: availableProducts.slice(0, limit),
      hasMore: availableProducts.length > limit,
      limit,
      offset,
    };
  }
  // Metodo para validar los parametros de la busqueda.
  private validateParams(params: SearchProductsParams): void {
    // Valida el limit.
    if (
      params.limit !== undefined &&
      (params.limit < 1 || params.limit > 100)
    ) {
      throw new InvalidSearchParamsError("Limit must be between 1 and 100");
    }
    // Valida el offset.
    if (params.offset !== undefined && params.offset < 0) {
      throw new InvalidSearchParamsError(
        "Offset must be greater than or equal to 0"
      );
    }
  }
}
