import { OrderService } from './services/order.service';
import { ProductRepository } from './repositories/product.repository';
import { UserRepository } from './repositories/user.repository';
import { getPaginationParams } from './utils/pagination';

async function main() {
  console.log('🚀 Starting Database Integration Demo\n');

  // Initialize repositories and services
  const userRepo = new UserRepository();
  const productRepo = new ProductRepository();
  const orderService = new OrderService();

  // 1. Create a new user
  console.log('📝 Creating new user...');
  const newUser = await userRepo.create({
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'hashed_password_here'
  });
  console.log('✅ User created:', { id: newUser.id, name: newUser.name, email: newUser.email });
  console.log('---');

  // 2. Get all users with pagination
  console.log('👥 Fetching all users...');
  const pagination = getPaginationParams(1, 10);
  const users = await userRepo.findAll(pagination);
  console.log(`✅ Found ${users.total} users`);
  console.log('---');

  // 3. Search products with full-text search
  console.log('🔍 Searching for "phone" products...');
  const searchResults = await productRepo.search(
    { query: 'phone', minPrice: 500, maxPrice: 1000 },
    pagination
  );
  console.log(`✅ Found ${searchResults.total} products matching "phone"`);
  searchResults.data.forEach(product => {
    console.log(`   - ${product.name}: $${product.price}`);
  });
  console.log('---');

  // 4. Create an order (with transaction)
  console.log('🛒 Creating new order...');
  try {
    const newOrder = await orderService.createOrder({
      userId: newUser.id,
      items: [
        { productId: 'product_id_here', quantity: 2 } // You'll need to replace with actual product ID
      ]
    });
    console.log('✅ Order created:', { id: newOrder.id, total: newOrder.total });
  } catch (error) {
    console.log('⚠️  Need to run seeding first to get product IDs');
  }
  console.log('---');

  // 5. Complex query: Get orders with user and product details
  console.log('📦 Fetching all orders with details...');
  const orders = await orderService.getAllOrders(1, 20, { status: 'COMPLETED' });
  console.log(`✅ Found ${orders.total} completed orders`);
  if (orders.data.length > 0) {
    const sampleOrder = orders.data[0];
    console.log('   Sample order:', {
      id: sampleOrder.id,
      user: sampleOrder.user?.name,
      total: sampleOrder.total,
      items: sampleOrder.items?.length
    });
  }
  console.log('---');

  // 6. Calculate total revenue from completed orders
  console.log('💰 Calculating total revenue...');
  const revenue = await orderService.getCompletedOrdersRevenue(
    new Date('2024-01-01'),
    new Date()
  );
  console.log(`✅ Total revenue: $${revenue.toFixed(2)}`);
  console.log('---');

  // 7. Soft delete demonstration
  console.log('🗑️  Performing soft delete on user...');
  const deletedUser = await userRepo.softDelete(newUser.id);
  console.log(`✅ User ${deletedUser.name} has been soft deleted (deletedAt: ${deletedUser.deletedAt})`);
  
  // Verify user is not found in normal queries
  const foundUser = await userRepo.findById(newUser.id);
  console.log(`   User exists in normal queries: ${foundUser ? 'Yes' : 'No'}`);
  console.log('---');

  console.log('✨ Demo completed successfully!');
}

// Run the demo
main().catch(console.error);