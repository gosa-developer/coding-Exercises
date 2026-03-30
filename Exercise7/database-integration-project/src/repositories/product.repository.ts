import { PrismaClient, Product, Prisma } from '@prisma/client';
import { PaginationParams, PaginatedResult, SearchParams } from '../types';
import { getSkipTake, createPaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

export class ProductRepository {
  async create(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
    images?: string[];
  }): Promise<Product> {
    return prisma.product.create({
      data: {
        ...data,
        category: data.category as any,
        images: data.images || []
      }
    });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
        isActive: true
      }
    });
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Product>> {
    const where = { deletedAt: null, isActive: true };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        ...getSkipTake(params),
        orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' }
      }),
      prisma.product.count({ where })
    ]);
    
    return createPaginatedResult(products, total, params);
  }

  // Full-text search implementation
  async search(params: SearchParams, pagination: PaginationParams): Promise<PaginatedResult<Product>> {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      AND: []
    };

    if (params.query) {
      where.AND.push({
        OR: [
          { name: { contains: params.query, mode: 'insensitive' } },
          { description: { contains: params.query, mode: 'insensitive' } }
        ]
      });
    }

    if (params.category) {
      where.AND.push({ category: params.category as any });
    }

    if (params.minPrice !== undefined) {
      where.AND.push({ price: { gte: params.minPrice } });
    }

    if (params.maxPrice !== undefined) {
      where.AND.push({ price: { lte: params.maxPrice } });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        ...getSkipTake(pagination),
        orderBy: { price: pagination.sortOrder || 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    return createPaginatedResult(products, total, pagination);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
  }

  async softDelete(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
}