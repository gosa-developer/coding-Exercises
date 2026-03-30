import { PrismaClient, Prisma } from '@prisma/client';
import type { Order, OrderStatus } from '@prisma/client';
import { PaginationParams, PaginatedResult, OrderFilter, CreateOrderInput } from '../types';
import { getSkipTake, createPaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

export class OrderRepository {
  async createOrderWithTransaction(data: CreateOrderInput): Promise<Order> {
    // Transaction to ensure data integrity
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Calculate total and check stock
      let total = 0;
      const orderItems: Array<{
        productId: string;
        quantity: number;
        price: number;
      }> = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });

        // Update stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          total,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return order;
    });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    });
  }

  // Complex query with joins, pagination, and filtering
  async findAllWithFilters(
    pagination: PaginationParams,
    filters: OrderFilter
  ): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status as OrderStatus;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
      where.total = {};
      if (filters.minTotal !== undefined) where.total.gte = filters.minTotal;
      if (filters.maxTotal !== undefined) where.total.lte = filters.maxTotal;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        },
        ...getSkipTake(pagination),
        orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return createPaginatedResult(orders, total, pagination);
  }

  async getCompletedOrdersRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const where: Prisma.OrderWhereInput = {
      status: 'COMPLETED'
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const result = await prisma.order.aggregate({
      where,
      _sum: {
        total: true
      }
    });

    return result._sum.total || 0;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  async getUserOrders(userId: string, pagination: PaginationParams): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = { userId };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        },
        ...getSkipTake(pagination),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return createPaginatedResult(orders, total, pagination);
  }
}