// src/middleware/logger.ts

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DataSanitizer } from '../utils/sanitizer';
import { consoleLogger } from '../utils/console-logger';
import { LogEntry, LoggingConfig } from '../types/logging.types';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
      sanitizedBody?: any;
    }
  }
}

// Default configuration
const defaultConfig: LoggingConfig = {
  logRequestBody: true,
  logResponseBody: false,
  maxBodyLength: 500,
  sanitizeFields: ['password', 'token', 'creditCard', 'ssn'],
  logHeaders: false,
  logIpAddress: true,
  excludePaths: ['/health', '/metrics', '/favicon.ico']
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return uuidv4().substring(0, 8);
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (typeof forwarded === 'object' && forwarded !== null) {
    return forwarded[0];
  }
  return req.socket.remoteAddress || req.ip || 'unknown';
}

/**
 * Main logging middleware
 */
export const requestLogger = (config: Partial<LoggingConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip logging for excluded paths
    if (finalConfig.excludePaths.includes(req.path)) {
      return next();
    }
    
    // Generate unique request ID
    req.requestId = generateRequestId();
    req.startTime = Date.now();
    
    // Log request details
    const ip = finalConfig.logIpAddress ? getClientIp(req) : 'redacted';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referer = req.headers['referer'] || req.headers['referrer'];
    
    // Sanitize request body
    let sanitizedBody: any = null;
    if (finalConfig.logRequestBody && req.body && Object.keys(req.body).length > 0) {
      sanitizedBody = DataSanitizer.sanitize(req.body, {
        fieldsToRedact: finalConfig.sanitizeFields,
        maxLength: finalConfig.maxBodyLength
      });
      req.sanitizedBody = sanitizedBody;
    }
    
    // Log request start (for debugging)
    consoleLogger.debug(`[${req.requestId}] Request started: ${req.method} ${req.url}`);
    
    // Log request details
    const requestEntry: Partial<LogEntry> = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      method: req.method,
      url: req.url,
      ip: ip as string,
      userAgent: userAgent as string,
      referer: referer as string | undefined
    };
    
    if (sanitizedBody) {
      requestEntry.requestBody = sanitizedBody;
    }
    
    if (finalConfig.logHeaders) {
      // Convert headers to a plain object with proper typing
      const headersObj: Record<string, string> = {};
      Object.keys(req.headers).forEach(key => {
        const value = req.headers[key];
        if (typeof value === 'string') {
          headersObj[key] = value;
        } else if (Array.isArray(value)) {
          headersObj[key] = value.join(', ');
        }
      });
      requestEntry.requestBody = {
        ...requestEntry.requestBody,
        headers: DataSanitizer.sanitizeHeaders(headersObj)
      };
    }
    
    consoleLogger.logRequest(requestEntry);
    
    // Capture response
    let responseBody: any;
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override json method to capture response body
    if (finalConfig.logResponseBody) {
      res.json = function(body: any): Response {
        responseBody = body;
        return originalJson.call(this, body);
      };
      
      res.send = function(body: any): Response {
        if (body && typeof body === 'object') {
          responseBody = body;
        }
        return originalSend.call(this, body);
      };
    }
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - (req.startTime || Date.now());
      const statusCode = res.statusCode;
      
      // Determine log level based on status code
      let level: 'INFO' | 'WARN' | 'ERROR' = 'INFO';
      if (statusCode >= 500) level = 'ERROR';
      else if (statusCode >= 400) level = 'WARN';
      
      // Sanitize response body if needed
      let sanitizedResponse: any = null;
      if (finalConfig.logResponseBody && responseBody) {
        sanitizedResponse = DataSanitizer.sanitize(responseBody, {
          fieldsToRedact: finalConfig.sanitizeFields,
          maxLength: finalConfig.maxBodyLength
        });
      }
      
      // Create log entry
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        method: req.method,
        url: req.url,
        ip: ip as string,
        statusCode,
        duration,
        userAgent: userAgent as string,
        referer: referer as string | undefined
      };
      
      if (req.sanitizedBody) {
        logEntry.requestBody = req.sanitizedBody;
      }
      
      if (sanitizedResponse) {
        logEntry.responseBody = sanitizedResponse;
      }
      
      // Log the complete entry
      consoleLogger.logRequest(logEntry);
      
      // Additional error logging if applicable
      if (statusCode >= 500) {
        consoleLogger.error(`[${req.requestId}] Server error: ${statusCode} - ${req.method} ${req.url}`);
      } else if (statusCode >= 400) {
        consoleLogger.warn(`[${req.requestId}] Client error: ${statusCode} - ${req.method} ${req.url}`);
      }
      
      // Log performance warning for slow requests
      if (duration > 1000) {
        consoleLogger.warn(`[${req.requestId}] Slow request detected: ${duration}ms - ${req.method} ${req.url}`);
      }
    });
    
    next();
  };
};

/**
 * Error logging middleware
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const ip = getClientIp(req);
  
  consoleLogger.error(`[ERROR] ${timestamp} - ${req.method} ${req.url} - IP: ${ip}`);
  consoleLogger.error(`  Error: ${err.message}`);
  if (err.stack) {
    consoleLogger.error(`  Stack: ${err.stack}`);
  }
  
  next(err);
};

/**
 * Performance monitoring middleware
 */
export const performanceLogger = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime();
    
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const duration = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      
      if (parseFloat(duration) > 100) {
        consoleLogger.warn(`Performance: ${req.method} ${req.url} took ${duration}ms`);
      }
    });
    
    next();
  };
};