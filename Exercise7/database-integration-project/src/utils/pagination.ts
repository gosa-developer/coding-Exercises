import { PaginationParams, PaginatedResult } from '../types';

export function getPaginationParams(page: number = 1, limit: number = 10): PaginationParams {
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
}

export function getSkipTake(params: PaginationParams) {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit)
  };
}