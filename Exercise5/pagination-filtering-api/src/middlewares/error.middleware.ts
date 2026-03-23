// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  success: boolean;
  error: string;
  timestamp: string;
  stack?: string;
}

/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code (default to 500)
  let statusCode = 500;
  let errorMessage = err.message || 'Internal server error';

  // Handle specific error types
  if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (err.message.includes('required')) {
    statusCode = 400;
  } else if (err.message.includes('already exists')) {
    statusCode = 409;
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found middleware
 * Catches requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};