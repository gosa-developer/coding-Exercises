import { PrismaClient, Role, OrderStatus, Category } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN
      }
    }),
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
        role: Role.CUSTOMER
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('password123', 10),
        role: Role.CUSTOMER
      }
    })
  ]);

  console.log(`Created ${users.length} users`);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple smartphone with A17 Pro chip',
        price: 999.99,
        stock: 50,
        category: Category.ELECTRONICS,
        images: ['iphone15.jpg', 'iphone15_2.jpg']
      }
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone with AI features',
        price: 899.99,
        stock: 45,
        category: Category.ELECTRONICS,
        images: ['samsung24.jpg']
      }
    }),
    prisma.product.create({
      data: {
        name: 'Levi\'s Jeans',
        description: 'Classic blue jeans, 100% cotton',
        price: 79.99,
        stock: 200,
        category: Category.CLOTHING,
        images: ['jeans.jpg']
      }
    }),
    prisma.product.create({
      data: {
        name: 'The Great Gatsby',
        description: 'Classic novel by F. Scott Fitzgerald',
        price: 15.99,
        stock: 150,
        category: Category.BOOKS,
        images: ['gatsby.jpg']
      }
    }),
    prisma.product.create({
      data: {
        name: 'Organic Coffee Beans',
        description: 'Freshly roasted organic coffee beans',
        price: 24.99,
        stock: 300,
        category: Category.FOOD,
        images: ['coffee.jpg']
      }
    })
  ]);

  console.log(`Created ${products.length} products`);

  // Create orders with items
  const order1 = await prisma.order.create({
    data: {
      userId: users[1].id,
      status: OrderStatus.COMPLETED,
      total: 1079.98,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price
          },
          {
            productId: products[3].id,
            quantity: 5,
            price: products[3].price
          }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      userId: users[2].id,
      status: OrderStatus.PENDING,
      total: 899.99,
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price
          }
        ]
      }
    }
  });

  const order3 = await prisma.order.create({
    data: {
      userId: users[1].id,
      status: OrderStatus.COMPLETED,
      total: 104.98,
      items: {
        create: [
          {
            productId: products[2].id,
            quantity: 1,
            price: products[2].price
          },
          {
            productId: products[4].id,
            quantity: 1,
            price: products[4].price
          }
        ]
      }
    }
  });

  console.log(`Created ${await prisma.order.count()} orders`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });