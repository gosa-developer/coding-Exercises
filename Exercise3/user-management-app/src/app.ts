// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.get('corsOrigin')
    }));
    
    // Logging
    this.app.use(morgan('dev'));
    this.app.use(requestLogger);
    
    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.get('nodeEnv')
      });
    });

    // API routes
    const apiVersion = config.get('apiVersion');
    this.app.use(`/api/${apiVersion}/users`, userRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'User Management API',
        version: apiVersion,
        documentation: '/api-docs',
        endpoints: {
          health: '/health',
          users: `/api/${apiVersion}/users`
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
    const port = config.get('port');
    this.app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📝 Environment: ${config.get('nodeEnv')}`);
      console.log(`🔗 API Version: ${config.get('apiVersion')}`);
      console.log(`✨ http://localhost:${port}`);
    });
  }
}

export default App;