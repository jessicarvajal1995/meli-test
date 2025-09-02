import { ProductService } from "@/application/services/ProductService";
import { GetProductById } from "@/application/use-cases/GetProductById";
import { SearchProducts } from "@/application/use-cases/SearchProducts";
import { JsonProductRepository } from "@/adapters/repositories/JsonProductRepository";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductController } from "@/adapters/controllers/ProductController";

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerServices(): void {
    const productRepository: ProductRepository = new JsonProductRepository();
    this.services.set("ProductRepository", productRepository);

    const getProductByIdUseCase = new GetProductById(productRepository);
    const searchProductsUseCase = new SearchProducts(productRepository);

    this.services.set("GetProductById", getProductByIdUseCase);
    this.services.set("SearchProducts", searchProductsUseCase);

    const productService = new ProductService(
      getProductByIdUseCase,
      searchProductsUseCase,
    );
    this.services.set("ProductService", productService);

    const productController = new ProductController(productService);
    this.services.set("ProductController", productController);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }

  public getProductController(): ProductController {
    return this.get<ProductController>("ProductController");
  }

  public getProductService(): ProductService {
    return this.get<ProductService>("ProductService");
  }

  public getProductRepository(): ProductRepository {
    return this.get<ProductRepository>("ProductRepository");
  }
}
