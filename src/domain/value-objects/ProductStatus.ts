export class ProductStatus {
  private static readonly VALID_STATUSES = [
    "active",
    "inactive",
    "pending",
    "discontinued",
  ] as const;

  private constructor(private readonly value: string) {
    this.validate(value);
  }

  public static fromString(value: string): ProductStatus {
    return new ProductStatus(value.toLowerCase());
  }

  public static active(): ProductStatus {
    return new ProductStatus("active");
  }

  public static inactive(): ProductStatus {
    return new ProductStatus("inactive");
  }

  public static pending(): ProductStatus {
    return new ProductStatus("pending");
  }

  public static discontinued(): ProductStatus {
    return new ProductStatus("discontinued");
  }

  public toString(): string {
    return this.value;
  }

  public isActive(): boolean {
    return this.value === "active";
  }

  public isInactive(): boolean {
    return this.value === "inactive";
  }

  public isPending(): boolean {
    return this.value === "pending";
  }

  public isDiscontinued(): boolean {
    return this.value === "discontinued";
  }

  public equals(other: ProductStatus): boolean {
    return this.value === other.value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("ProductStatus cannot be empty");
    }

    const normalizedValue = value.toLowerCase();
    if (!ProductStatus.VALID_STATUSES.includes(normalizedValue as any)) {
      throw new Error(
        `Invalid ProductStatus: ${value}. Valid statuses are: ${ProductStatus.VALID_STATUSES.join(", ")}`,
      );
    }
  }
}
