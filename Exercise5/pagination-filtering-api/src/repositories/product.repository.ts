// src/repositories/product.repository.ts

import { Product, CreateProductDTO, UpdateProductDTO, FilterParams, SortParams, PaginationParams } from '../types/product.types';
import { v4 as uuidv4 } from 'uuid';

export class ProductRepository {
  private products: Map<string, Product>;
  
  constructor() {
    this.products = new Map();
    this.seedData();
  }

  /**
   * Seed initial data with 100+ products for testing pagination
   */
  private seedData(): void {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
    const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Amazon', 'Google', 'Microsoft'];
    const products: CreateProductDTO[] = [];
    
    for (let i = 1; i <= 150; i++) {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      const price = Math.floor(Math.random() * 1000) + 10;
      const rating = Math.floor(Math.random() * 50) / 10 + 0.5; // 0.5 to 5.5
      
      products.push({
        name: `Product ${i}: ${category} ${brand} Item`,
        description: `This is a detailed description for product ${i}. It includes all the features and specifications that customers need to know.`,
        price,
        category,
        brand,
        inStock: Math.random() > 0.2,
        rating: Math.min(5, rating)
      });
    }
    
    products.forEach(product => this.create(product));
  }

  /**
   * Apply filters to products
   */
  private applyFilters(products: Product[], filters: FilterParams): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }
      
      // Price range filter
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }
      
      // In stock filter
      if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
        return false;
      }
      
      // Rating filter
      if (filters.minRating !== undefined && product.rating < filters.minRating) {
        return false;
      }
      
      // Search filter (case-insensitive)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return product.name.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
      }
      
      return true;
    });
  }

  /**
   * Apply sorting to products
   */
  private applySort(products: Product[], sort: SortParams[]): Product[] {
    return [...products].sort((a, b) => {
      for (const sortParam of sort) {
        const aValue = a[sortParam.field as keyof Product];
        const bValue = b[sortParam.field as keyof Product];
        
        if (aValue === bValue) continue;
        
        if (sortParam.order === 'asc') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      }
      return 0;
    });
  }

  /**
   * Apply pagination to products
   */
  private applyPagination(products: Product[], pagination: PaginationParams): Product[] {
    return products.slice(pagination.skip, pagination.skip + pagination.limit);
  }

  /**
   * Find all products with filters, sorting, and pagination
   */
  async findAllWithFilters(
    filters: FilterParams,
    sort: SortParams[],
    pagination: PaginationParams
  ): Promise<{ products: Product[]; total: number }> {
    let allProducts = Array.from(this.products.values());
    
    // Apply filters
    allProducts = this.applyFilters(allProducts, filters);
    const total = allProducts.length;
    
    // Apply sorting
    allProducts = this.applySort(allProducts, sort);
    
    // Apply pagination
    const products = this.applyPagination(allProducts, pagination);
    
    return { products, total };
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  /**
   * Create new product
   */
  async create(createProductDTO: CreateProductDTO): Promise<Product> {
    const now = new Date();
    const product: Product = {
      id: uuidv4(),
      ...createProductDTO,
      inStock: createProductDTO.inStock ?? true,
      rating: createProductDTO.rating ?? 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.products.set(product.id, product);
    return product;
  }

  /**
   * Update existing product
   */
  async update(id: string, updateProductDTO: UpdateProductDTO): Promise<Product | null> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return null;
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateProductDTO,
      updatedAt: new Date()
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  /**
   * Get all unique categories (for filter options)
   */
  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const product of this.products.values()) {
      categories.add(product.category);
    }
    return Array.from(categories).sort();
  }

  /**
   * Get all unique brands (for filter options)
   */
  async getBrands(): Promise<string[]> {
    const brands = new Set<string>();
    for (const product of this.products.values()) {
      brands.add(product.brand);
    }
    return Array.from(brands).sort();
  }
}

export const productRepository = new ProductRepository();