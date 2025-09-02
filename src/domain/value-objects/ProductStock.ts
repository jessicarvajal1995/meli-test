export class ProductStock {
  private constructor(private readonly value: number) {
    this.validate(value);
  }

  public static fromNumber(value: number): ProductStock {
    return new ProductStock(value);
  }

  public static empty(): ProductStock {
    return new ProductStock(0);
  }

  public static withQuantity(quantity: number): ProductStock {
    return new ProductStock(quantity);
  }

  public getValue(): number {
    return this.value;
  }

  public isEmpty(): boolean {
    return this.value === 0;
  }

  public hasStock(quantity: number = 1): boolean {
    return this.value >= quantity;
  }

  public isAvailable(): boolean {
    return this.value > 0;
  }

  public add(quantity: number): ProductStock {
    if (quantity < 0) {
      throw new Error("Cannot add negative quantity to stock");
    }
    return new ProductStock(this.value + quantity);
  }

  public subtract(quantity: number): ProductStock {
    if (quantity < 0) {
      throw new Error("Cannot subtract negative quantity from stock");
    }
    if (quantity > this.value) {
      throw new Error("Cannot subtract more than available stock");
    }
    return new ProductStock(this.value - quantity);
  }

  public equals(other: ProductStock): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }

  private validate(value: number): void {
    if (value < 0) {
      throw new Error("Stock cannot be negative");
    }

    if (!Number.isInteger(value)) {
      throw new Error("Stock must be a whole number");
    }
  }
}
