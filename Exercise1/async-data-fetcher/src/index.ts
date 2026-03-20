

import { FetchConfig, FetchResponse, FetchError } from './types/fetcher';

//  Sleep utility for delay between retries
 
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

//  Calculate exponential backoff delay
 
const getBackoffDelay = (attempt: number, baseDelay: number = 1000): number => {
  return baseDelay * Math.pow(2, attempt);
};

//  Main fetchData function with retry logic and error handling

export async function fetchData<T = any>(
  config: FetchConfig
): Promise<FetchResponse<T>> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    timeout = 5000,
    retries = 3
  } = config;

  let lastError: FetchError | undefined;

  // Try the request with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body) {
        fetchOptions.body = JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const error: FetchError = {
          type: 'http',
          message: `HTTP error ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };

        // If this was the last attempt, return error
        if (attempt === retries) {
          return { success: false, error };
        }

        lastError = error;
        
        // Wait before retrying (but not for 4xx errors - these are client errors)
        if (response.status >= 500) {
          const delay = getBackoffDelay(attempt);
          await sleep(delay);
        }
        continue;
      }

      // Parse response data
      const data = await response.json() as T;

      // Success!
      return {
        success: true,
        data
      };

    } catch (error) {
      // Handle different types of errors
      let fetchError: FetchError;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          fetchError = {
            type: 'timeout',
            message: `Request timeout after ${timeout}ms`
          };
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          fetchError = {
            type: 'network',
            message: `Network error: ${error.message}`
          };
        } else {
          fetchError = {
            type: 'network',
            message: error.message
          };
        }
      } else {
        fetchError = {
          type: 'network',
          message: 'Unknown error occurred'
        };
      }

      // If this was the last attempt, return error
      if (attempt === retries) {
        return { success: false, error: fetchError };
      }

      lastError = fetchError;

      // Wait before retrying
      const delay = getBackoffDelay(attempt);
      await sleep(delay);
    }
  }

  // This should never happen, but TypeScript requires a return
  return {
    success: false,
    error: lastError || {
      type: 'network',
      message: 'Maximum retries exceeded'
    }
  };
}