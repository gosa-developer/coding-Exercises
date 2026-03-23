// src/services/product.service.ts

import { productRepository } from '../repositories/product.repository';
import { 
  Product, 
  CreateProductDTO, 
  UpdateProductDTO, 
  FilterParams,
  SortParams,
  PaginationParams,
  PaginatedResponse,
  QueryOptions
} from '../types/product.types';
import { QueryParser } from '../utils/query-parser';

export class ProductService {
  /**
   * Get all products with pagination, filtering, and sorting
   */
  async getAllProducts(queryOptions: QueryOptions): Promise<PaginatedResponse<Product>> {
    const { pagination, filters, sort } = queryOptions;
    
    const { products, total } = await productRepository.findAllWithFilters(
      filters,
      sort,
      pagination
    );
    
    const totalPages = Math.ceil(total / pagination.limit);
    
    return {
      data: products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      },
      filters,
      sort: sort.map(s => `${s.order === 'desc' ? '-' : ''}${s.field}`)
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return await productRepository.findById(id);
  }

  /**
   * Create new product
   */
  async createProduct(createProductDTO: CreateProductDTO): Promise<Product> {
    // Validate required fields
    if (!createProductDTO.name || !createProductDTO.description || !createProductDTO.price) {
      throw new Error('Name, description, and price are required');
    }
    
    if (createProductDTO.price < 0) {
      throw new Error('Price must be greater than 0');
    }
    
    return await productRepository.create(createProductDTO);
  }

  /**
   * Update product
   */
  async updateProduct(id: string, updateProductDTO: UpdateProductDTO): Promise<Product> {
    const product = await productRepository.update(id, updateProductDTO);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    const deleted = await productRepository.delete(id);
    if (!deleted) {
      throw new Error(`Product with id ${id} not found`);
    }
  }

  /**
   * Get filter options (available categories and brands)
   */
  async getFilterOptions(): Promise<{ categories: string[]; brands: string[] }> {
    const [categories, brands] = await Promise.all([
      productRepository.getCategories(),
      productRepository.getBrands()
    ]);
    
    return { categories, brands };
  }
}

export const productService = new ProductService();