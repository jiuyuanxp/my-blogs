// Article Types
export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  author: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleInput {
  title: string;
  content: string;
  summary?: string;
  author: string;
  published?: boolean;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface UserInput {
  email: string;
  name: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Environment Types
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: number;
  API_URL?: string;
  DATABASE_URL?: string;
}
