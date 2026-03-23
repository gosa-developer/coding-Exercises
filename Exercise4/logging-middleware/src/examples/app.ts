// src/examples/app.ts

import express, { Request, Response, NextFunction } from 'express';
import { requestLogger, errorLogger, performanceLogger } from '../middleware/logger';
import { consoleLogger } from '../utils/console-logger';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply logging middleware with custom configuration
app.use(requestLogger({
  logRequestBody: true,
  logResponseBody: true,
  maxBodyLength: 200,
  sanitizeFields: ['password', 'token', 'creditCard'],
  logHeaders: false,
  logIpAddress: true,
  excludePaths: ['/health', '/metrics']
}));

// Apply performance monitoring
app.use(performanceLogger());

// Health check endpoint (excluded from logging)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Example endpoints
app.get('/users', (req: Request, res: Response) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json({ success: true, data: users });
});

app.get('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: parseInt(id),
    name: 'User ' + id,
    email: `user${id}@example.com`
  });
});

app.post('/users', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Create user (simulated)
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  // Password will be sanitized in logs automatically
  consoleLogger.info(`User created: ${email}`);
  
  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
});

app.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  res.json({
    success: true,
    data: { id, ...updates, updatedAt: new Date().toISOString() }
  });
});

app.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: `User ${id} deleted successfully`
  });
});

// Error simulation endpoint
app.get('/error', (req: Request, res: Response) => {
  throw new Error('Simulated server error');
});

// Slow endpoint to test performance logging
app.get('/slow', async (req: Request, res: Response) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  res.json({ message: 'Slow response' });
});

// Endpoint with sensitive data
app.post('/login', (req: Request, res: Response) => {
  const { username, password, token } = req.body;
  
  // Even though we log the request, passwords will be sanitized
  consoleLogger.info(`Login attempt for user: ${username}`);
  
  if (username === 'admin' && password === 'secret') {
    res.json({
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Error handling middleware (should be last)
app.use(errorLogger);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  consoleLogger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;