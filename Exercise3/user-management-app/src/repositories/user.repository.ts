// src/repositories/user.repository.ts

import { User, CreateUserDTO, UpdateUserDTO } from '../types/user.types';

// In-memory database
class UserRepository {
  private users: Map<string, User>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Add some initial data
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const initialUsers: CreateUserDTO[] = [
      { name: 'John Doe', email: 'john@example.com', age: 30 },
      { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      { name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
    ];

    initialUsers.forEach(user => this.create(user));
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email) || null;
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const id = (this.currentId++).toString();
    const now = new Date();
    
    const user: User = {
      id,
      ...createUserDTO,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async update(id: string, updateUserDTO: UpdateUserDTO): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) return null;
    
    const updatedUser: User = {
      ...existingUser,
      ...updateUserDTO,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  // For testing/utility purposes
  async clear(): Promise<void> {
    this.users.clear();
    this.currentId = 1;
  }
}

export const userRepository = new UserRepository();