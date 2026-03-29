// pagination-api/src/types/index.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  inStock?: boolean;
}

// Filter Operators
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface FilterCondition {
  [operator: string]: string | number | boolean | string[];
}

// Query Parameters Types
export interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  [key: string]: string | undefined;
}

// Pagination Metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Applied Filters for Response
export type AppliedFilters = Record<string, string | number | boolean | FilterCondition>;

// Standard API Response
export interface ApiResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  filters?: AppliedFilters;
  sort?: string[];
}