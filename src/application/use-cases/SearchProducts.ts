import { Product } from "@/domain/entities/Product";
import { InvalidSearchParamsError } from "@/domain/errors/InvalidSearchParamsError";
import { ProductRepository } from "@/domain/repositories/ProductRepository";

export interface SearchProductsParams {
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchProductsResponse {
  products: Product[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

export class SearchProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(params: SearchProductsParams): Promise<SearchProductsResponse> {
    this.validateParams(params);

    const { categoryId, limit = 20, offset = 0 } = params;

    const products = !categoryId
      ? await this.productRepository.findAll(limit + 1, offset)
      : await this.productRepository.findByCategory(
          categoryId,
          limit + 1,
          offset
        );

    return {
      products: products.slice(0, limit),
      hasMore: products.length > limit,
      limit,
      offset,
    };
  }

  private validateParams(params: SearchProductsParams): void {
    if (
      params.limit !== undefined &&
      (params.limit < 1 || params.limit > 100)
    ) {
      throw new InvalidSearchParamsError("Limit must be between 1 and 100");
    }

    if (params.offset !== undefined && params.offset < 0) {
      throw new InvalidSearchParamsError(
        "Offset must be greater than or equal to 0"
      );
    }
  }
}
