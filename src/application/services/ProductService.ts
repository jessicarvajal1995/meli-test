import { ProductDetailDto } from "@/adapters/dtos/ProductDto";
import {
  SearchProductsParamsDto,
  SearchProductsResponseDto,
} from "@/adapters/dtos/SearchProductsDto";
import { ProductDtoMapper } from "@/adapters/mappers/ProductDtoMapper";
import { GetProductById } from "@/application/use-cases/GetProductById";
import { SearchProducts } from "@/application/use-cases/SearchProducts";

export class ProductService {
  constructor(
    private readonly getProductByIdUseCase: GetProductById,
    private readonly searchProductsUseCase: SearchProducts
  ) {}

  async getProductDetail(productId: string): Promise<ProductDetailDto> {
    const product = await this.getProductByIdUseCase.execute(productId);
    return ProductDtoMapper.toDetailDto(product);
  }

  async searchProducts(
    params: SearchProductsParamsDto
  ): Promise<SearchProductsResponseDto> {
    const searchResponse = await this.searchProductsUseCase.execute(params);
    return ProductDtoMapper.toSearchResponseDto(searchResponse);
  }

  async getRelatedProducts(
    productId: string,
    limit = 4
  ): Promise<SearchProductsResponseDto> {
    const originalProduct = await this.getProductByIdUseCase.execute(productId);

    const relatedProducts = await this.searchProductsUseCase.execute({
      categoryId: originalProduct.categoryId,
      limit: limit + 1,
    });

    const filteredProducts = relatedProducts.products.filter(
      (product) => !product.id.equals(originalProduct.id)
    );

    const filteredResponse = {
      ...relatedProducts,
      products: filteredProducts.slice(0, limit),
    };

    return ProductDtoMapper.toSearchResponseDto(filteredResponse);
  }
}
