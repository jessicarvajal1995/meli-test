import { FastifyRequest, FastifyReply } from "fastify";
import { ProductService } from "@/application/services/ProductService";
import { ProductNotFoundError } from "@/domain/errors/ProductNotFoundError";
import { InvalidSearchParamsError } from "@/domain/errors/InvalidSearchParamsError";
import { RepositoryError } from "@/domain/errors/RepositoryError";
import { SearchProductsParamsDto } from "@/adapters/dtos/SearchProductsDto";

interface GetProductParams {
  id: string;
}

interface SearchProductsQuery {
  categoryId?: string;
  limit?: string;
  offset?: string;
}

interface RelatedProductsParams {
  id: string;
}

interface RelatedProductsQuery {
  limit?: string;
}

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async getProductDetail(
    request: FastifyRequest<{ Params: GetProductParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id } = request.params;

      if (!id || id.trim() === "") {
        reply.code(400).send({
          error: "Bad Request",
          message: "Product ID is required",
          statusCode: 400,
        });
        return;
      }

      const product = await this.productService.getProductDetail(id);

      reply.code(200).send({
        data: product,
        statusCode: 200,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async searchProducts(
    request: FastifyRequest<{ Querystring: SearchProductsQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { categoryId, limit, offset } = request.query;

      const searchParams: SearchProductsParamsDto = {};
      if (categoryId) {
        searchParams.categoryId = categoryId;
      }
      if (limit) {
        searchParams.limit = parseInt(limit, 10);
      }
      if (offset) {
        searchParams.offset = parseInt(offset, 10);
      }

      const result = await this.productService.searchProducts(searchParams);

      reply.code(200).send({
        data: result,
        statusCode: 200,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getRelatedProducts(
    request: FastifyRequest<{
      Params: RelatedProductsParams;
      Querystring: RelatedProductsQuery;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id } = request.params;
      const { limit } = request.query;

      if (!id || id.trim() === "") {
        reply.code(400).send({
          error: "Bad Request",
          message: "Product ID is required",
          statusCode: 400,
        });
        return;
      }

      const limitNumber = limit ? parseInt(limit, 10) : 4;

      if (limitNumber < 1 || limitNumber > 20) {
        reply.code(400).send({
          error: "Bad Request",
          message: "Limit must be between 1 and 20",
          statusCode: 400,
        });
        return;
      }

      const result = await this.productService.getRelatedProducts(
        id,
        limitNumber,
      );

      reply.code(200).send({
        data: result,
        statusCode: 200,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof ProductNotFoundError) {
      reply.code(404).send({
        error: "Not Found",
        message: error.message,
        statusCode: 404,
      });
      return;
    }

    if (error instanceof InvalidSearchParamsError) {
      reply.code(400).send({
        error: "Bad Request",
        message: error.message,
        statusCode: 400,
      });
      return;
    }

    if (error instanceof RepositoryError) {
      reply.code(500).send({
        error: "Internal Server Error",
        message: "An error occurred while processing your request",
        statusCode: 500,
      });
      return;
    }

    console.error("Unexpected error:", error);
    reply.code(500).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500,
    });
  }
}
