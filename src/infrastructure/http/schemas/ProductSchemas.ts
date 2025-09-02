export const ProductSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    price: {
      type: "object",
      properties: {
        amount: { type: "number" },
        currency: { type: "string" },
      },
    },
    categoryId: { type: "string" },
    status: { type: "string" },
    stock: {
      type: "object",
      properties: {
        quantity: { type: "number" },
        isAvailable: { type: "boolean" },
      },
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    isAvailable: { type: "boolean" },
  },
} as const;

export const PaginationSchema = {
  type: "object",
  properties: {
    limit: { type: "number" },
    offset: { type: "number" },
    hasMore: { type: "boolean" },
  },
} as const;

export const ApiResponseSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number" },
  },
} as const;

export const ErrorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    statusCode: { type: "number" },
  },
} as const;

export const GetProductResponseSchema = {
  type: "object",
  properties: {
    data: ProductSchema,
    ...ApiResponseSchema.properties,
  },
} as const;

export const SearchProductsResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        products: {
          type: "array",
          items: ProductSchema,
        },
        pagination: PaginationSchema,
      },
    },
    ...ApiResponseSchema.properties,
  },
} as const;
