import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { PaginationParams, OrderFilter, CreateOrderInput } from '../types';
import { getPaginationParams } from '../utils/pagination';

export class OrderService {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
  }

  async createOrder(data: CreateOrderInput) {
    // Validate products exist and have sufficient stock
    for (const item of data.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
    }

    return await this.orderRepository.createOrderWithTransaction(data);
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getAllOrders(page: number = 1, limit: number = 10, filters: OrderFilter = {}) {
    const pagination = getPaginationParams(page, limit);
    return await this.orderRepository.findAllWithFilters(pagination, filters);
  }

  async getCompletedOrdersRevenue(startDate?: Date, endDate?: Date) {
    return await this.orderRepository.getCompletedOrdersRevenue(startDate, endDate);
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return await this.orderRepository.updateStatus(id, status as any);
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const pagination = getPaginationParams(page, limit);
    return await this.orderRepository.getUserOrders(userId, pagination);
  }
}