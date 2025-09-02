import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { Container } from "@/infrastructure/di/Container";
import { ProductController } from "@/adapters/controllers/ProductController";
import {
  GetProductResponseSchema,
  SearchProductsResponseSchema,
  ErrorResponseSchema,
} from "./schemas/ProductSchemas";

export class FastifyServer {
  private server: FastifyInstance;
  private container: Container;
  private productController: ProductController;

  constructor() {
    console.log("FastifyServer constructor: Creating fastify instance...");
    this.server = fastify({
      logger: {
        level: "info",
        transport: {
          target: "pino-pretty",
        },
      },
    });
    console.log("FastifyServer constructor: Getting container instance...");
    this.container = Container.getInstance();
    console.log("FastifyServer constructor: Getting product controller...");
    this.productController = this.container.getProductController();

    console.log("FastifyServer constructor: Setting up routes...");
    this.setupRoutes();
    console.log("FastifyServer constructor: Setting up error handling...");
    this.setupErrorHandling();
    console.log("FastifyServer constructor: Initialization complete");
  }

  private async setupMiddleware(): Promise<void> {
    await this.server.register(cors, {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    this.server.get("/health", async (_request, reply) => {
      reply.send({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  private setupRoutes(): void {
    this.server.register(
      async (fastify) => {
        fastify.get(
          "/products/:id",
          {
            schema: {
              params: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
                required: ["id"],
              },
              response: {
                200: GetProductResponseSchema,
                404: ErrorResponseSchema,
              },
            },
          },
          this.productController.getProductDetail.bind(this.productController),
        );

        fastify.get(
          "/products",
          {
            schema: {
              querystring: {
                type: "object",
                properties: {
                  categoryId: { type: "string" },
                  limit: { type: "string", pattern: "^[0-9]+$" },
                  offset: { type: "string", pattern: "^[0-9]+$" },
                },
              },
              response: {
                200: SearchProductsResponseSchema,
              },
            },
          },
          this.productController.searchProducts.bind(this.productController),
        );

        fastify.get(
          "/products/:id/related",
          {
            schema: {
              params: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
                required: ["id"],
              },
              querystring: {
                type: "object",
                properties: {
                  limit: { type: "string", pattern: "^[0-9]+$" },
                },
              },
              response: {
                200: SearchProductsResponseSchema,
                404: ErrorResponseSchema,
              },
            },
          },
          this.productController.getRelatedProducts.bind(
            this.productController,
          ),
        );
      },
      { prefix: "/api/v1" },
    );
  }

  private setupErrorHandling(): void {
    this.server.setErrorHandler((error, _request, reply) => {
      this.server.log.error(error);

      if (error.validation) {
        reply.status(400).send({
          error: "Bad Request",
          message: "Invalid request parameters",
          details: error.validation,
          statusCode: 400,
        });
        return;
      }

      reply.status(500).send({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        statusCode: 500,
      });
    });

    this.server.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        error: "Not Found",
        message: `Route ${request.method} ${request.url} not found`,
        statusCode: 404,
      });
    });
  }

  public async start(
    port: number = 3000,
    host: string = "0.0.0.0",
  ): Promise<void> {
    try {
      console.log("Setting up middleware...");
      await this.setupMiddleware();
      console.log("Middleware setup complete");

      console.log("Starting server listener...");
      await this.server.listen({ port, host });
      this.server.log.info(`Server listening on http://${host}:${port}`);
      this.server.log.info("Available routes:");
      this.server.log.info("GET /health - Health check");
      this.server.log.info("GET /api/v1/products - Search products");
      this.server.log.info("GET /api/v1/products/:id - Get product detail");
      this.server.log.info(
        "GET /api/v1/products/:id/related - Get related products",
      );
    } catch (error) {
      this.server.log.error("Failed to start server:");
      this.server.log.error(error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    await this.server.close();
  }

  public getServer(): FastifyInstance {
    return this.server;
  }
}
