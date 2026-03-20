// fetcher data from an API endpoint with support for retries and timeouts

export interface FetchConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number; // in milliseconds
  retries?: number;
}

export interface FetchError {
  type: 'network' | 'http' | 'timeout';
  message: string;
  statusCode?: number;
}

export interface FetchResponse<T> {
  success: boolean;
  data?: T;
  error?: FetchError;
}