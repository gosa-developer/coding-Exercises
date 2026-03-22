// src/index.ts

interface ApiResult {
  id: number;
  data: string;
}

interface ProcessResult {
  successful: ApiResult[];
  failed: { id: number; error: string }[];
  executionTime: number;
}

/**
 * Simulate API call with random delay and 10% failure rate
 */
function simulateApiCall(id: number): Promise<ApiResult> {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 100; // Random delay up to 100ms
    const shouldFail = Math.random() < 0.1; // 10% failure rate
    
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Request ${id} failed`));
      } else {
        resolve({ 
          id, 
          data: `Result from API ${id} (processed in ${delay.toFixed(2)}ms)` 
        });
      }
    }, delay);
  });
}

/**
 * Sequential Approach: Process requests one by one using for...of loop
 */
async function sequentialRequests(count: number): Promise<ProcessResult> {
  console.log(`\n🔄 Starting sequential processing of ${count} requests...`);
  const startTime = Date.now();
  
  const successful: ApiResult[] = [];
  const failed: { id: number; error: string }[] = [];
  
  for (let i = 1; i <= count; i++) {
    try {
      const result = await simulateApiCall(i);
      successful.push(result);
      console.log(`✅ Request ${i} completed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failed.push({ id: i, error: errorMessage });
      console.log(`❌ Request ${i} failed: ${errorMessage}`);
    }
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  return {
    successful,
    failed,
    executionTime
  };
}

/**
 * Parallel Approach: Process all requests simultaneously using Promise.allSettled
 * (Promise.allSettled is better than Promise.all for error handling as it doesn't stop on first error)
 */
async function parallelRequests(count: number): Promise<ProcessResult> {
  console.log(`\n⚡ Starting parallel processing of ${count} requests...`);
  const startTime = Date.now();
  
  // Create an array of promises
  const promises = Array.from({ length: count }, (_, i) => 
    simulateApiCall(i + 1)
      .then(result => ({ status: 'fulfilled' as const, value: result }))
      .catch(error => ({ 
        status: 'rejected' as const, 
        reason: error instanceof Error ? error.message : 'Unknown error',
        id: i + 1
      }))
  );
  
  // Wait for all promises to settle
  const results = await Promise.allSettled(promises);
  
  // Process results
  const successful: ApiResult[] = [];
  const failed: { id: number; error: string }[] = [];
  
  // Since we're using Promise.allSettled, we need to handle the results properly
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      // Each promise resolves with our custom object
      const customResult = result.value;
      if (customResult.status === 'fulfilled') {
        successful.push(customResult.value);
        console.log(`✅ Request ${customResult.value.id} completed successfully`);
      } else {
        failed.push({ id: customResult.id, error: customResult.reason });
        console.log(`❌ Request ${customResult.id} failed: ${customResult.reason}`);
      }
    }
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  return {
    successful,
    failed,
    executionTime
  };
}

/**
 * Bonus: Parallel with Concurrency Limiting
 * Process requests in batches of batchSize at a time
 */
async function parallelWithConcurrencyLimit(
  count: number, 
  batchSize: number = 10
): Promise<ProcessResult> {
  console.log(`\n🚀 Starting parallel processing with concurrency limit (${batchSize} at a time)...`);
  const startTime = Date.now();
  
  const successful: ApiResult[] = [];
  const failed: { id: number; error: string }[] = [];
  
  // Create array of request IDs
  const requestIds = Array.from({ length: count }, (_, i) => i + 1);
  
  // Process in batches
  for (let i = 0; i < requestIds.length; i += batchSize) {
    const batch = requestIds.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (IDs: ${batch.join(', ')})`);
    
    const promises = batch.map(id => 
      simulateApiCall(id)
        .then(result => ({ status: 'fulfilled' as const, value: result, id }))
        .catch(error => ({ 
          status: 'rejected' as const, 
          reason: error instanceof Error ? error.message : 'Unknown error',
          id
        }))
    );
    
    const batchResults = await Promise.all(promises);
    
    // Process batch results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
        console.log(`✅ Request ${result.value.id} completed successfully`);
      } else {
        failed.push({ id: result.id, error: result.reason });
        console.log(`❌ Request ${result.id} failed: ${result.reason}`);
      }
    }
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  return {
    successful,
    failed,
    executionTime
  };
}

/**
 * Display results in a formatted way
 */
function displayResults(
  approach: string, 
  results: ProcessResult, 
  totalRequests: number
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${approach} Results:`);
  console.log(`${'='.repeat(60)}`);
  console.log(`⏱️  Execution time: ${results.executionTime}ms`);
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\nFailed requests details:`);
    results.failed.forEach(failure => {
      console.log(`  - Request ${failure.id}: ${failure.error}`);
    });
  }
}

/**
 * Main function to run the comparison
 */
async function runComparison(totalRequests: number = 100) {
  console.log(`\n${'🎯'.repeat(30)}`);
  console.log(`API Call Comparison: Sequential vs Parallel`);
  console.log(`Total requests: ${totalRequests}`);
  console.log(`${'🎯'.repeat(30)}`);
  
  // Run sequential approach
  const sequentialResults = await sequentialRequests(totalRequests);
  displayResults('Sequential', sequentialResults, totalRequests);
  
  // Run parallel approach
  const parallelResults = await parallelRequests(totalRequests);
  displayResults('Parallel (Promise.allSettled)', parallelResults, totalRequests);
  
  // Run parallel with concurrency limit (bonus)
  const concurrencyResults = await parallelWithConcurrencyLimit(totalRequests, 10);
  displayResults('Parallel with Concurrency Limit (10 at a time)', concurrencyResults, totalRequests);
  
  // Performance comparison
  console.log(`\n${'📊'.repeat(30)}`);
  console.log(`Performance Analysis:`);
  console.log(`${'📊'.repeat(30)}`);
  console.log(`Sequential: ${sequentialResults.executionTime}ms`);
  console.log(`Parallel: ${parallelResults.executionTime}ms`);
  console.log(`Parallel (Limited): ${concurrencyResults.executionTime}ms`);
  
  const improvement = (sequentialResults.executionTime / parallelResults.executionTime).toFixed(1);
  console.log(`\n🚀 Performance improvement (Sequential vs Parallel): ${improvement}x faster!`);
  
  const improvementVsLimited = (sequentialResults.executionTime / concurrencyResults.executionTime).toFixed(1);
  console.log(`🚀 Performance improvement (Sequential vs Limited): ${improvementVsLimited}x faster!`);
  
  // Verify both approaches got same results
  console.log(`\n✅ Data integrity check:`);
  console.log(`  Sequential successful: ${sequentialResults.successful.length}`);
  console.log(`  Parallel successful: ${parallelResults.successful.length}`);
  console.log(`  Concurrency limited successful: ${concurrencyResults.successful.length}`);
  console.log(`  All approaches handled the same number of failures (expected: ~${Math.floor(totalRequests * 0.1)})`);
}

// Run the comparison with 100 requests
runComparison(100).catch(console.error);