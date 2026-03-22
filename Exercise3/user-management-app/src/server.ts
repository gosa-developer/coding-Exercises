// src/server.ts

import App from './app';
import { config } from './config';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Using default values from config');
}

// Create and start the application
const app = new App();
app.listen();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});