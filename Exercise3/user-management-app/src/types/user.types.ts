// src/types/user.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  age?: number;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  age?: number;
}

export interface UserResponse extends User {
  profileComplete: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}