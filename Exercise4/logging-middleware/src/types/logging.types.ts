// src/types/logging.types.ts

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  method: string;
  url: string;
  ip: string;
  statusCode?: number;
  duration?: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  userAgent?: string;
  referer?: string;
}

export interface LoggingConfig {
  logRequestBody: boolean;
  logResponseBody: boolean;
  maxBodyLength: number;
  sanitizeFields: string[];
  logHeaders: boolean;
  logIpAddress: boolean;
  excludePaths: string[];
}

// Remove RequestWithLog interface since we're using declaration merging