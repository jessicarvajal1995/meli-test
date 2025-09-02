export class Price {
  constructor(
    private readonly amount: number,
    private readonly currency: string,
    private readonly originalAmount?: number,
  ) {
    this.validate();
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getOriginalAmount(): number | undefined {
    return this.originalAmount;
  }

  public hasDiscount(): boolean {
    return (
      this.originalAmount !== undefined && this.originalAmount > this.amount
    );
  }

  public getDiscountPercentage(): number {
    if (!this.hasDiscount() || !this.originalAmount) {
      return 0;
    }

    const discount = this.originalAmount - this.amount;
    return Math.round((discount / this.originalAmount) * 100);
  }

  public format(): string {
    const formattedAmount = this.amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${this.currency} ${formattedAmount}`;
  }

  public equals(other: Price): boolean {
    return (
      this.amount === other.amount &&
      this.currency === other.currency &&
      this.originalAmount === other.originalAmount
    );
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error("Price amount cannot be negative");
    }

    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error("Currency cannot be empty");
    }

    if (this.originalAmount !== undefined && this.originalAmount < 0) {
      throw new Error("Original price amount cannot be negative");
    }

    if (
      this.originalAmount !== undefined &&
      this.originalAmount < this.amount
    ) {
      throw new Error("Original price cannot be less than current price");
    }
  }
}
