// src/services/user.service.ts

import { User, CreateUserDTO, UpdateUserDTO, UserResponse } from '../types/user.types';
import { userRepository } from '../repositories/user.repository';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await userRepository.findAll();
    return users.map(user => this.enrichUserResponse(user));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return this.enrichUserResponse(user);
  }

  /**
   * Create a new user
   */
  async createUser(createUserDTO: CreateUserDTO): Promise<UserResponse> {
    // Validate input
    this.validateCreateUser(createUserDTO);
    
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(createUserDTO.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${createUserDTO.email} already exists`);
    }
    
    // Create user
    const user = await userRepository.create(createUserDTO);
    return this.enrichUserResponse(user);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, updateUserDTO: UpdateUserDTO): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    // Validate update data
    this.validateUpdateUser(updateUserDTO);
    
    // Check email uniqueness if email is being updated
    if (updateUserDTO.email && updateUserDTO.email !== existingUser.email) {
      const userWithEmail = await userRepository.findByEmail(updateUserDTO.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictError(`User with email ${updateUserDTO.email} already exists`);
      }
    }
    
    // Update user
    const updatedUser = await userRepository.update(id, updateUserDTO);
    if (!updatedUser) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return this.enrichUserResponse(updatedUser);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete user with id ${id}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{ totalUsers: number; averageAge: number }> {
    const users = await userRepository.findAll();
    const totalUsers = users.length;
    const usersWithAge = users.filter(user => user.age);
    const averageAge = usersWithAge.length > 0
      ? usersWithAge.reduce((sum, user) => sum + (user.age || 0), 0) / usersWithAge.length
      : 0;
    
    return { totalUsers, averageAge };
  }

  /**
   * Enrich user response with computed fields
   */
  private enrichUserResponse(user: User): UserResponse {
    const profileComplete = !!(user.name && user.email);
    return {
      ...user,
      profileComplete
    };
  }

  /**
   * Validate create user input
   */
  private validateCreateUser(data: CreateUserDTO): void {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (data.age !== undefined && (data.age < 0 || data.age > 150)) {
      errors.push('Age must be between 0 and 150');
    }
    
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Validate update user input
   */
  private validateUpdateUser(data: UpdateUserDTO): void {
    const errors: string[] = [];
    
    if (data.name !== undefined && data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (data.name !== undefined && data.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (data.email !== undefined && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (data.age !== undefined && (data.age < 0 || data.age > 150)) {
      errors.push('Age must be between 0 and 150');
    }
    
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const userService = new UserService();