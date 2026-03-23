// src/types/product.types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  inStock: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  inStock?: boolean;
  rating?: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  inStock?: boolean;
  rating?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface FilterParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  search?: string;
  [key: string]: any;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface QueryOptions {
  pagination: PaginationParams;
  filters: FilterParams;
  sort: SortParams[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: FilterParams;
  sort: string[];
}