// pagination-api/src/utils/queryBuilder.ts

import { Product, QueryParams, PaginationMeta, AppliedFilters, FilterOperator } from '../types';

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Fields that should not be treated as filters
const RESERVED_PARAMS = ['page', 'limit', 'sort'];

/**
 * Parse sort string into array of sort criteria
 * Example: "-price,name" => ["-price", "name"]
 */
function parseSortCriteria(sortStr: string | undefined): string[] {
  if (!sortStr) return [];
  return sortStr.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Check if a field uses operator syntax
 * Example: "price[gte]" => { field: "price", operator: "gte" }
 */
function parseFieldOperators(key: string): { field: string; operator: string | null } {
  const match = key.match(/^(\w+)\[(\w+)\]$/);
  if (match) {
    return { field: match[1], operator: match[2] };
  }
  return { field: key, operator: null };
}

/**
 * Apply filter condition to a single product
 */
function applyFilterCondition(
  product: Product,
  field: string,
  operator: string | null,
  value: string
): boolean {
  // FIX: Cast to 'unknown' first before 'Record<string, unknown>'
  const fieldValue = (product as unknown as Record<string, unknown>)[field];

  // Handle nested field access (if needed)
  if (fieldValue === undefined) return false;

  // Convert string value to appropriate type based on field value
  let typedValue: string | number | boolean = value;
  if (typeof fieldValue === 'number') {
    typedValue = parseFloat(value);
    if (isNaN(typedValue)) return false;
  } else if (typeof fieldValue === 'boolean') {
    typedValue = value.toLowerCase() === 'true';
  }

  if (operator) {
    return applyOperator(fieldValue, operator as FilterOperator, typedValue);
  }

  // Default: exact match (case-insensitive for strings)
  if (typeof fieldValue === 'string' && typeof typedValue === 'string') {
    return fieldValue.toLowerCase() === typedValue.toLowerCase();
  }
  return fieldValue === typedValue;
}

/**
 * Apply comparison operator
 */
function applyOperator(
  fieldValue: unknown,
  operator: FilterOperator,
  compareValue: string | number | boolean
): boolean {
  if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
    switch (operator) {
      case 'eq': return fieldValue.toLowerCase() === compareValue.toLowerCase();
      case 'ne': return fieldValue.toLowerCase() !== compareValue.toLowerCase();
      case 'contains': return fieldValue.toLowerCase().includes(compareValue.toLowerCase());
      case 'in': return compareValue.split(',').map(v => v.trim().toLowerCase()).includes(fieldValue.toLowerCase());
      default: return false;
    }
  }

  if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
    switch (operator) {
      case 'eq': return fieldValue === compareValue;
      case 'ne': return fieldValue !== compareValue;
      case 'gt': return fieldValue > compareValue;
      case 'gte': return fieldValue >= compareValue;
      case 'lt': return fieldValue < compareValue;
      case 'lte': return fieldValue <= compareValue;
      case 'in': return compareValue.toString().split(',').map(v => parseFloat(v.trim())).includes(fieldValue);
      default: return false;
    }
  }

  if (typeof fieldValue === 'boolean' && typeof compareValue === 'boolean') {
    switch (operator) {
      case 'eq': return fieldValue === compareValue;
      case 'ne': return fieldValue !== compareValue;
      default: return false;
    }
  }

  return false;
}

/**
 * Apply sorting to products array
 */
function applySorting(products: Product[], sortCriteria: string[]): Product[] {
  if (sortCriteria.length === 0) return products;

  return [...products].sort((a, b) => {
    for (const criterion of sortCriteria) {
      const isDescending = criterion.startsWith('-');
      const field = isDescending ? criterion.slice(1) : criterion;

      // FIX: Cast to 'unknown' first before 'Record<string, unknown>'
      const valueA = (a as unknown as Record<string, unknown>)[field];
      const valueB = (b as unknown as Record<string, unknown>)[field];

      if (valueA === valueB) continue;

      let comparison = 0;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        comparison = Number(valueA) - Number(valueB);
      }

      if (comparison !== 0) {
        return isDescending ? -comparison : comparison;
      }
    }
    return 0;
  });
}

/**
 * Build and execute query with pagination, filtering, and sorting
 */
export function buildQuery(allProducts: Product[], queryParams: QueryParams) {
  // Extract pagination params
  const page = Math.max(1, parseInt(queryParams.page || '') || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(queryParams.limit || '') || DEFAULT_LIMIT));

  // Parse sort criteria
  const sortCriteria = parseSortCriteria(queryParams.sort);

  // Build filters
  const appliedFilters: AppliedFilters = {};
  let filteredProducts = [...allProducts];

  // Process filter parameters
  for (const [key, value] of Object.entries(queryParams)) {
    if (RESERVED_PARAMS.includes(key) || !value) continue;

    const { field, operator } = parseFieldOperators(key);

    // FIX: Cast to 'unknown' first before 'Record<string, unknown>'
    const firstProductType = allProducts[0] 
      ? typeof (allProducts[0] as unknown as Record<string, unknown>)?.[field] 
      : 'string';

    // Store applied filter for response
    if (operator) {
      if (!appliedFilters[field]) {
        appliedFilters[field] = {};
      }
      const filterObj = appliedFilters[field] as Record<string, string | number>;
      filterObj[operator] = firstProductType === 'number'
        ? parseFloat(value)
        : value;
    } else {
      appliedFilters[field] = firstProductType === 'number'
        ? parseFloat(value)
        : value;
    }

    // Apply filter
    filteredProducts = filteredProducts.filter(product =>
      applyFilterCondition(product, field, operator, value)
    );
  }

  // Get total count after filtering (before pagination)
  const total = filteredProducts.length;

  // Apply sorting
  const sortedProducts = applySorting(filteredProducts, sortCriteria);

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + limit);

  // Build pagination metadata
  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: startIndex + limit < total,
    hasPrev: page > 1,
  };

  return {
    data: paginatedProducts,
    pagination,
    filters: Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined,
    sort: sortCriteria.length > 0 ? sortCriteria : undefined,
  };
}