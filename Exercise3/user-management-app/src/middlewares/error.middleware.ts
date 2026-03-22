// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { config } from '../config';

interface ErrorResponse {
  success: boolean;
  error: string;
  message?: string;
  details?: any;
  timestamp: string;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      timestamp
    };
    
    if (err instanceof ValidationError && 'errors' in err) {
      response.details = (err as any).errors;
    }
    
    if (config.isDevelopment()) {
      response.stack = err.stack;
    }
    
    res.status(err.statusCode).json(response);
    return;
  }
  
  // Unknown error
  console.error('Unhandled error:', err);
  
  const response: ErrorResponse = {
    success: false,
    error: config.isDevelopment() ? err.message : 'Internal server error',
    timestamp
  };
  
  if (config.isDevelopment()) {
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
};