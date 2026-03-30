export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderFilter {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
}

export interface SearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateOrderInput {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface UpdateOrderInput {
  status?: OrderStatus;
}