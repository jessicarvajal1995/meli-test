import { v4 as uuidv4 } from "uuid";

export class ProductId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  public static fromString(value: string): ProductId {
    return new ProductId(value);
  }

  public static generate(): ProductId {
    return new ProductId(uuidv4());
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("ProductId cannot be empty");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const customIdRegex = /^[A-Z]{3}[0-9]{6,}$/;

    if (!uuidRegex.test(value) && !customIdRegex.test(value)) {
      throw new Error("Invalid ProductId format");
    }
  }
}
