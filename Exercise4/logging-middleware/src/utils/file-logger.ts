// src/utils/file-logger.ts

import fs from 'fs';
import path from 'path';

export class FileLogger {
  private logDir: string;
  private maxFileSize: number;
  private currentLogFile: string;

  constructor(logDir: string = 'logs', maxFileSize: number = 10 * 1024 * 1024) {
    this.logDir = logDir;
    this.maxFileSize = maxFileSize;
    this.currentLogFile = path.join(logDir, `app-${this.getDateString()}.log`);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private rotateLogIfNeeded(): void {
    if (fs.existsSync(this.currentLogFile)) {
      const stats = fs.statSync(this.currentLogFile);
      if (stats.size >= this.maxFileSize) {
        const timestamp = Date.now();
        const rotatedFile = `${this.currentLogFile}.${timestamp}`;
        fs.renameSync(this.currentLogFile, rotatedFile);
        this.currentLogFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
      }
    }
  }

  private writeLog(level: string, message: string): void {
    try {
      this.rotateLogIfNeeded();
      const logEntry = `[${new Date().toISOString()}] ${level}: ${message}\n`;
      fs.appendFileSync(this.currentLogFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message: string): void {
    this.writeLog('INFO', message);
  }

  warn(message: string): void {
    this.writeLog('WARN', message);
  }

  error(message: string): void {
    this.writeLog('ERROR', message);
  }

  debug(message: string): void {
    this.writeLog('DEBUG', message);
  }

  logRequest(entry: any): void {
    const { method, url, statusCode, duration, ip, requestBody, error } = entry;
    const message = `${method} ${url} - ${statusCode} - ${duration}ms - IP: ${ip}`;
    
    if (statusCode >= 500) {
      this.error(message + (error ? ` - Error: ${error}` : ''));
    } else if (statusCode >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
    
    if (requestBody) {
      this.debug(`  Request Body: ${JSON.stringify(requestBody)}`);
    }
  }
}