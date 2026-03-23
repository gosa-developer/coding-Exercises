// src/utils/query-parser.ts

import { FilterParams, SortParams, QueryOptions } from '../types/product.types';

export class QueryParser {
  /**
   * Parse pagination parameters
   */
  static parsePagination(page: any, limit: any): { page: number; limit: number; skip: number } {
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (parsedPage - 1) * parsedLimit;
    
    return {
      page: parsedPage,
      limit: parsedLimit,
      skip
    };
  }

  /**
   * Parse filter parameters
   * Supports:
   * - Simple: ?category=electronics
   * - Range: ?price[gte]=100&price[lte]=500
   * - Multiple: ?category=electronics&brand=Apple
   * - Search: ?search=laptop
   */
  static parseFilters(query: any): FilterParams {
    const filters: FilterParams = {};
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    
    for (const [key, value] of Object.entries(query)) {
      if (excludedFields.includes(key)) continue;
      
      // Handle nested operators (gte, lte, gt, lt)
      if (typeof value === 'object' && value !== null) {
        const operators: any = {};
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case 'gte':
              operators.minPrice = parseFloat(opValue as string);
              break;
            case 'lte':
              operators.maxPrice = parseFloat(opValue as string);
              break;
            case 'gt':
              operators.minPrice = parseFloat(opValue as string);
              break;
            case 'lt':
              operators.maxPrice = parseFloat(opValue as string);
              break;
          }
        }
        if (key === 'price') {
          Object.assign(filters, operators);
        }
      } 
      // Handle simple filters
      else {
        switch (key) {
          case 'category':
            filters.category = value as string;
            break;
          case 'brand':
            filters.brand = value as string;
            break;
          case 'inStock':
            filters.inStock = value === 'true';
            break;
          case 'rating':
            filters.minRating = parseFloat(value as string);
            break;
          case 'search':
            filters.search = value as string;
            break;
          default:
            filters[key] = value;
        }
      }
    }
    
    return filters;
  }

  /**
   * Parse sort parameters
   * Format: ?sort=-price,name (negative = descending)
   */
  static parseSort(sortParam: any): SortParams[] {
    if (!sortParam) {
      return [{ field: 'createdAt', order: 'desc' }];
    }
    
    const sortFields = (sortParam as string).split(',');
    const sort: SortParams[] = [];
    
    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sort.push({ field: field.substring(1), order: 'desc' });
      } else {
        sort.push({ field, order: 'asc' });
      }
    }
    
    return sort;
  }

  /**
   * Parse all query options
   */
  static parseQueryOptions(query: any): QueryOptions {
    const pagination = this.parsePagination(query.page, query.limit);
    const filters = this.parseFilters(query);
    const sort = this.parseSort(query.sort);
    
    return {
      pagination,
      filters,
      sort
    };
  }
}