// src/test.ts

import { fetchData } from './index';

async function runTests() {
  console.log('🧪 Running tests...\n');

  // Test 1: Successful request
  console.log('Test 1: Successful GET request');
  const result1 = await fetchData({
    url: 'https://jsonplaceholder.typicode.com/posts/1'
  });
  console.log('Result:', result1.success ? '✅' : '❌', '\n');

  // Test 2: Retry on server error (simulated)
  console.log('Test 2: Retry on server error');
  const result2 = await fetchData({
    url: 'https://httpstat.us/500', // Returns 500 error
    retries: 2
  });
  console.log('Result:', result2.success ? '✅' : '❌', result2.error, '\n');

  // Test 3: Network error (invalid URL)
  console.log('Test 3: Network error');
  const result3 = await fetchData({
    url: 'https://nonexistent-domain-12345.com',
    retries: 1
  });
  console.log('Result:', result3.success ? '✅' : '❌', result3.error, '\n');

  // Test 4: Custom headers
  console.log('Test 4: Request with custom headers');
  const result4 = await fetchData({
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: {
      'Authorization': 'Bearer token123',
      'X-Custom-Header': 'custom-value'
    }
  });
  console.log('Result:', result4.success ? '✅' : '❌', '\n');
}

runTests();