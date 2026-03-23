// src/utils/sanitizer.ts

export interface SanitizeOptions {
  fieldsToRedact?: string[];
  maxLength?: number;
  maskChar?: string;
  maskLength?: number;
}

/**
 * Sanitize sensitive data from objects
 */
export class DataSanitizer {
  private static defaultRedactFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'secret',
    'apiKey',
    'api_key',
    'creditCard',
    'credit_card',
    'cvv',
    'ssn',
    'socialSecurity'
  ];

  /**
   * Sanitize request/response body
   */
  static sanitize(body: any, options?: SanitizeOptions): any {
    if (!body) return body;
    
    const fieldsToRedact = [...this.defaultRedactFields, ...(options?.fieldsToRedact || [])];
    const maxLength = options?.maxLength || 1000;
    const maskChar = options?.maskChar || '*';
    const maskLength = options?.maskLength || 4;
    
    // Handle different data types
    if (typeof body === 'string') {
      return this.sanitizeString(body, maxLength);
    }
    
    if (Array.isArray(body)) {
      return body.map(item => this.sanitizeObject(item, fieldsToRedact, maskChar, maskLength));
    }
    
    if (typeof body === 'object' && body !== null) {
      return this.sanitizeObject(body, fieldsToRedact, maskChar, maskLength);
    }
    
    return body;
  }
  
  private static sanitizeObject(
    obj: any,
    fieldsToRedact: string[],
    maskChar: string,
    maskLength: number
  ): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    
    for (const key of Object.keys(sanitized)) {
      // Redact sensitive fields
      if (this.shouldRedact(key, fieldsToRedact)) {
        sanitized[key] = this.redactValue(sanitized[key], maskChar, maskLength);
      }
      
      // Recursively sanitize nested objects
      if (sanitized[key] && typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeObject(sanitized[key], fieldsToRedact, maskChar, maskLength);
      }
    }
    
    return sanitized;
  }
  
  private static shouldRedact(key: string, fieldsToRedact: string[]): boolean {
    const lowerKey = key.toLowerCase();
    return fieldsToRedact.some(field => lowerKey.includes(field.toLowerCase()));
  }
  
  private static redactValue(value: any, maskChar: string, maskLength: number): string {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    if (value.length <= maskLength) {
      return maskChar.repeat(value.length);
    }
    
    const visibleLength = Math.min(4, Math.floor(value.length * 0.3));
    const start = value.substring(0, visibleLength);
    const end = value.substring(value.length - visibleLength);
    const maskedLength = Math.min(maskLength, value.length - (visibleLength * 2));
    
    return `${start}${maskChar.repeat(maskedLength)}${end}`;
  }
  
  private static sanitizeString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + `... [truncated, total length: ${str.length}]`;
    }
    return str;
  }
  
  /**
   * Sanitize headers (remove sensitive headers)
   */
  static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    if (!headers) return headers;
    
    const sanitized: Record<string, string> = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = this.redactValue(sanitized[header], '*', 6);
      }
    }
    
    return sanitized;
  }
}

/**
 * Quick sanitize function for common use cases
 */
export const sanitize = (body: any): any => {
  return DataSanitizer.sanitize(body);
};