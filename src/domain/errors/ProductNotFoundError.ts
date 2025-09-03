export class ProductNotFoundError extends Error {
  // Constructor de la clase.
  constructor(message: string) {
    super(message);
    this.name = "ProductNotFoundError";
  }
}
