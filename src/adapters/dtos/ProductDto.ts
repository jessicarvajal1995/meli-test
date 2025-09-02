export interface ProductDto {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  categoryId: string;
  status: string;
  stock: {
    quantity: number;
    isAvailable: boolean;
  };
  createdAt: string;
  updatedAt: string;
  isAvailable: boolean;
}

export interface ProductDetailDto extends ProductDto {}
