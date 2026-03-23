// src/utils/console-logger.ts

import chalk from 'chalk';
import { LogEntry } from '../types/logging.types';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class ConsoleLogger {
  private static instance: ConsoleLogger;
  private enableColors: boolean;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  private currentLogLevel: LogLevel = 'info';

  private constructor() {
    this.enableColors = true;
  }

  static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.currentLogLevel];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private colorize(level: LogLevel, text: string): string {
    if (!this.enableColors) return text;
    
    switch (level) {
      case 'info':
        return chalk.blue(text);
      case 'warn':
        return chalk.yellow(text);
      case 'error':
        return chalk.red(text);
      case 'debug':
        return chalk.gray(text);
      default:
        return text;
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      const timestamp = this.formatTimestamp();
      const formatted = `[${timestamp}] ${this.colorize('info', 'INFO:')} ${message}`;
      console.log(formatted, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      const timestamp = this.formatTimestamp();
      const formatted = `[${timestamp}] ${this.colorize('warn', 'WARN:')} ${message}`;
      console.warn(formatted, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      const timestamp = this.formatTimestamp();
      const formatted = `[${timestamp}] ${this.colorize('error', 'ERROR:')} ${message}`;
      console.error(formatted, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      const timestamp = this.formatTimestamp();
      const formatted = `[${timestamp}] ${this.colorize('debug', 'DEBUG:')} ${message}`;
      console.debug(formatted, ...args);
    }
  }

  logRequest(entry: Partial<LogEntry>): void {
    const { method, url, statusCode, duration, ip, requestBody, error } = entry;
    
    // Determine log level based on status code
    let level: LogLevel = 'info';
    if (statusCode && statusCode >= 500) level = 'error';
    else if (statusCode && statusCode >= 400) level = 'warn';
    
    const statusColor = this.getStatusColor(statusCode);
    const statusText = statusCode ? statusColor(statusCode) : 'N/A';
    
    const message = `${method} ${url} - ${statusText} - ${duration}ms - IP: ${ip}`;
    
    if (level === 'error') {
      this.error(message);
      if (error) {
        this.error(`  Error: ${error}`);
      }
    } else if (level === 'warn') {
      this.warn(message);
    } else {
      this.info(message);
    }
    
    // Log request body if present (debug level)
    if (requestBody && this.shouldLog('debug')) {
      this.debug(`  Request Body: ${JSON.stringify(requestBody)}`);
    }
  }

  private getStatusColor(statusCode?: number): (text: any) => string {
    if (!statusCode) return (text: any) => String(text);
    
    if (statusCode >= 500) return chalk.red;
    if (statusCode >= 400) return chalk.yellow;
    if (statusCode >= 300) return chalk.cyan;
    if (statusCode >= 200) return chalk.green;
    return chalk.white;
  }
}

export const consoleLogger = ConsoleLogger.getInstance();