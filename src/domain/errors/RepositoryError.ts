export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class ProductNotFoundError extends RepositoryError {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

export class DataIntegrityError extends RepositoryError {
  constructor(message: string) {
    super(message);
    this.name = "DataIntegrityError";
  }
}
