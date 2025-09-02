import { Product } from "@/domain/entities/Product";
import { ProductDto, ProductDetailDto } from "@/adapters/dtos/ProductDto";
import { SearchProductsResponse } from "@/application/use-cases/SearchProducts";
import { SearchProductsResponseDto } from "@/adapters/dtos/SearchProductsDto";
import { PaginationDto } from "@/adapters/dtos/PaginationDto";

export class ProductDtoMapper {
  static toDto(product: Product): ProductDto {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      price: {
        amount: product.price.getAmount(),
        currency: product.price.getCurrency(),
      },
      categoryId: product.categoryId,
      status: product.status.toString(),
      stock: {
        quantity: product.stock.getValue(),
        isAvailable: product.stock.isAvailable(),
      },
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isAvailable: product.isAvailable(),
    };
  }

  static toDetailDto(product: Product): ProductDetailDto {
    return this.toDto(product);
  }

  static toSearchResponseDto(
    searchResponse: SearchProductsResponse,
  ): SearchProductsResponseDto {
    const pagination: PaginationDto = {
      limit: searchResponse.limit,
      offset: searchResponse.offset,
      hasMore: searchResponse.hasMore,
    };

    return {
      products: searchResponse.products.map((product) => this.toDto(product)),
      pagination,
    };
  }
}
