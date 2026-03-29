// pagination-api/src/app.ts

import express, { Express, Request, Response } from 'express';
import {
  getProducts,
  getProductById,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from './controllers/productController';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { initializeProducts } from './models/product';

// Initialize Express app
const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// ============================================
// MIDDLEWARES
// ============================================

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req: Request, _res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CRUD API with Pagination, Filtering & Sorting',
    version: '1.0.0',
    endpoints: {
      'GET /products': 'Get all products (with pagination, filtering, sorting)',
      'GET /products/:id': 'Get single product',
      'POST /products': 'Create new product',
      'PUT /products/:id': 'Update product',
      'DELETE /products/:id': 'Delete product',
    },
    queryExamples: {
      pagination: '/products?page=2&limit=5',
      filtering: '/products?category=electronics',
      rangeFilter: '/products?price[gte]=50&price[lte]=150',
      sorting: '/products?sort=-price,name',
      combined: '/products?category=electronics&price[gte]=50&sort=-price&page=1&limit=5',
    },
  });
});

// Product routes
app.get('/products', getProducts);
app.get('/products/:id', getProductById);
app.post('/products', createProductHandler);
app.put('/products/:id', updateProductHandler);
app.delete('/products/:id', deleteProductHandler);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

// Initialize sample data
initializeProducts();

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📖 Available endpoints:');
  console.log(`   GET    http://localhost:${PORT}/`);
  console.log(`   GET    http://localhost:${PORT}/products`);
  console.log(`   GET    http://localhost:${PORT}/products/:id`);
  console.log(`   POST   http://localhost:${PORT}/products`);
  console.log(`   PUT    http://localhost:${PORT}/products/:id`);
  console.log(`   DELETE http://localhost:${PORT}/products/:id`);
  console.log('\n🔧 Query Examples:');
  console.log(`   Pagination:  http://localhost:${PORT}/products?page=2&limit=5`);
  console.log(`   Filtering:   http://localhost:${PORT}/products?category=electronics`);
  console.log(`   Range:       http://localhost:${PORT}/products?price[gte]=50&price[lte]=150`);
  console.log(`   Sorting:     http://localhost:${PORT}/products?sort=-price,name`);
  console.log(`   Combined:    http://localhost:${PORT}/products?category=electronics&price[gte]=50&sort=-price&page=1&limit=5`);
  console.log('');
});

export default app;