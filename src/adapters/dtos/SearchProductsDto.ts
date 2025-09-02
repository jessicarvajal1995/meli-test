import { ProductDto } from "./ProductDto";
import { PaginationDto } from "./PaginationDto";

export interface SearchProductsParamsDto {
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchProductsResponseDto {
  products: ProductDto[];
  pagination: PaginationDto;
}
