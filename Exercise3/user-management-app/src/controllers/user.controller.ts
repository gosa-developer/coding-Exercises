// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO, ApiResponse } from '../types/user.types';

export class UserController {
  /**
   * Get all users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      const response: ApiResponse = {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createUserDTO: CreateUserDTO = req.body;
      const user = await userService.createUser(createUserDTO);
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
        timestamp: new Date().toISOString()
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateUserDTO: UpdateUserDTO = req.body;
      const user = await userService.updateUser(id, updateUserDTO);
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getUserStats();
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully',
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();