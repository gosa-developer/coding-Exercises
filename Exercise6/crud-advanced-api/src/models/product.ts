// pagination-api/src/models/product.ts

import { Product, CreateProductDTO, UpdateProductDTO } from '../types';

// In-memory data store (simulates database)
let products: Product[] = [];

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Initialize with sample data
export function initializeProducts(): void {
  const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
  const sampleProducts: CreateProductDTO[] = [
    { name: 'Laptop Pro', description: 'High-performance laptop', price: 1299.99, category: 'electronics', inStock: true },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, category: 'electronics', inStock: true },
    { name: 'USB-C Hub', description: '7-in-1 USB hub', price: 49.99, category: 'electronics', inStock: false },
    { name: 'T-Shirt Premium', description: 'Cotton premium t-shirt', price: 24.99, category: 'clothing', inStock: true },
    { name: 'Jeans Classic', description: 'Classic fit jeans', price: 59.99, category: 'clothing', inStock: true },
    { name: 'Winter Jacket', description: 'Warm winter jacket', price: 149.99, category: 'clothing', inStock: false },
    { name: 'TypeScript Guide', description: 'Complete TypeScript book', price: 39.99, category: 'books', inStock: true },
    { name: 'Node.js Mastery', description: 'Advanced Node.js guide', price: 44.99, category: 'books', inStock: true },
    { name: 'Coffee Maker', description: 'Automatic coffee maker', price: 89.99, category: 'home', inStock: true },
    { name: 'Desk Lamp', description: 'LED desk lamp', price: 34.99, category: 'home', inStock: true },
    { name: 'Yoga Mat', description: 'Non-slip yoga mat', price: 29.99, category: 'sports', inStock: true },
    { name: 'Running Shoes', description: 'Lightweight running shoes', price: 99.99, category: 'sports', inStock: true },
    { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 79.99, category: 'electronics', inStock: true },
    { name: 'Monitor 27"', description: '4K IPS monitor', price: 399.99, category: 'electronics', inStock: false },
    { name: 'Hoodie', description: 'Comfortable hoodie', price: 49.99, category: 'clothing', inStock: true },
    { name: 'React Handbook', description: 'Complete React guide', price: 42.99, category: 'books', inStock: true },
    { name: 'Blender', description: 'Professional blender', price: 69.99, category: 'home', inStock: true },
    { name: 'Dumbbells Set', description: 'Adjustable dumbbells', price: 199.99, category: 'sports', inStock: false },
    { name: 'Webcam HD', description: '1080p webcam', price: 59.99, category: 'electronics', inStock: true },
    { name: 'Sneakers', description: 'Casual sneakers', price: 69.99, category: 'clothing', inStock: true },
  ];

  products = sampleProducts.map((item, index) => ({
    id: generateId() + index,
    ...item,
    inStock: item.inStock ?? true,
    createdAt: new Date(Date.now() - (index * 86400000)),
    updatedAt: new Date(Date.now() - (index * 86400000)),
  }));
}

// Get all products (for query processing)
export function getAllProducts(): Product[] {
  return [...products];
}

// Find product by ID
export function findProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Create new product
export function createProduct(data: CreateProductDTO): Product {
  const newProduct: Product = {
    id: generateId(),
    ...data,
    inStock: data.inStock ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  products.push(newProduct);
  return newProduct;
}

// Update product
export function updateProduct(id: string, data: UpdateProductDTO): Product | null {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...data,
    updatedAt: new Date(),
  };
  return products[index];
}

// Delete product
export function deleteProduct(id: string): boolean {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
}