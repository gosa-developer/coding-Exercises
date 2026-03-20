

import { fetchData } from './index';

// Example 1: Successful GET request
async function exampleGetTodos() {
  console.log('Example 1: Fetching todos...');
  
  const response = await fetchData<Array<{ id: number; title: string; completed: boolean }>>({
    url: 'https://jsonplaceholder.typicode.com/todos?_limit=3',
    timeout: 3000
  });

  if (response.success) {
    console.log('✅ Successfully fetched todos:');
    response.data?.forEach(todo => {
      console.log(`  - ${todo.title} (${todo.completed ? 'done' : 'pending'})`);
    });
  } else {
    console.log('❌ Failed to fetch todos:', response.error);
  }
  console.log('---');
}

// Example 2: POST request
async function exampleCreatePost() {
  console.log('Example 2: Creating a post...');
  
  const response = await fetchData<any>({
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'POST',
    body: {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    },
    timeout: 3000
  });

  if (response.success) {
    console.log('✅ Successfully created post:', response.data);
  } else {
    console.log('❌ Failed to create post:', response.error);
  }
  console.log('---');
}

// Example 3: Simulating a timeout error
async function exampleTimeout() {
  console.log('Example 3: Testing timeout (should fail)...');
  
  const response = await fetchData({
    url: 'https://jsonplaceholder.typicode.com/todos',
    timeout: 1, // 1ms timeout (will definitely timeout)
    retries: 1
  });

  if (response.success) {
    console.log('✅ Success:', response.data);
  } else {
    console.log('❌ Error:', response.error);
  }
  console.log('---');
}
// Run all examples
async function runExamples() {
  console.log('🚀 Starting Async Data Fetcher Examples\n');
  
  await exampleGetTodos();
  await exampleCreatePost();
  await exampleTimeout();
  
  console.log('✅ All examples completed!');
}

// Execute examples
runExamples().catch(console.error);