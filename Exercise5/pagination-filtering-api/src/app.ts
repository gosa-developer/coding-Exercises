// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middlewares/error.middleware';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
          products: '/api/products',
          documentation: '/api-docs'
        }
      });
    });

    // API routes
    this.app.use('/api/products', productRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Products API with Pagination & Filtering',
        version: '1.0.0',
        documentation: {
          pagination: '?page=1&limit=10',
          filtering: '?category=electronics&price[gte]=100&price[lte]=500',
          sorting: '?sort=-price,name',
          combined: '?category=electronics&price[gte]=100&sort=-price&page=1&limit=10'
        },
        examples: {
          getAllProducts: '/api/products',
          paginated: '/api/products?page=2&limit=20',
          filtered: '/api/products?category=Electronics',
          priceRange: '/api/products?price[gte]=100&price[lte]=500',
          sorted: '/api/products?sort=-price',
          search: '/api/products?search=laptop',
          combined: '/api/products?category=Electronics&price[gte]=100&sort=-price&page=1&limit=10',
          filterOptions: '/api/products/filters/options'
        }
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(): void {
    const PORT = process.env.PORT || 3000;
    this.app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`✨ http://localhost:${PORT}`);
      console.log(`\n📋 Test the API with these examples:`);
      console.log(`   GET  /api/products`);
      console.log(`   GET  /api/products?page=2&limit=10`);
      console.log(`   GET  /api/products?category=Electronics`);
      console.log(`   GET  /api/products?price[gte]=100&price[lte]=500`);
      console.log(`   GET  /api/products?sort=-price`);
      console.log(`   GET  /api/products?search=laptop`);
      console.log(`   GET  /api/products?category=Electronics&price[gte]=100&sort=-price&page=1&limit=10`);
      console.log(`   GET  /api/products/filters/options`);
    });
  }
}

export default App;