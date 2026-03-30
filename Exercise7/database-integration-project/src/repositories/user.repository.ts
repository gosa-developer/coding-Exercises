import { PrismaClient, User } from '@prisma/client';
import { PaginationParams, PaginatedResult } from '../types';
import { getSkipTake, createPaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

export class UserRepository {
  async create(data: { email: string; name: string; password: string }): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        role: 'CUSTOMER'
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null // Soft delete filter
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<User>> {
    const where = { deletedAt: null };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        ...getSkipTake(params),
        orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    return createPaginatedResult(users, total, params);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  // Soft delete
  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // Hard delete
  async hardDelete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }
}