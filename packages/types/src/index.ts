/**
 * 类型定义，以 Java 后端 DTO 为准（docs/api-contract.md、services/java/docs/api/）
 * ID 字段统一为 string，避免 JS 精度丢失
 */

// --- 分类 ---

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  children?: Category[];
}

// --- 文章 ---

export interface Article {
  id: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  summary?: string;
  content: string;
  status: 'draft' | 'published';
  views: number;
  isPinned: number;
  createdAt: string;
  updatedAt: string;
}

// --- 评论 ---

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  content: string;
  createdAt: string;
  deletedAt?: string | null;
}

// --- 分页 ---

export interface PageResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// --- 认证 ---

export interface MeResponse {
  id: number;
  username: string;
  nickname: string;
  role: string;
  permissions: string[];
}

// --- RBAC 用户 ---

export interface User {
  id: string;
  username: string;
  nickname?: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// --- RBAC 角色 ---

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

// --- RBAC 权限 ---

export interface Permission {
  id: string;
  code: string;
  name: string;
  type: 'menu' | 'button';
  parentId?: string | null;
  routePath?: string | null;
  component?: string | null;
  isHidden?: boolean;
  sortOrder: number;
  children?: Permission[];
  createdAt?: string;
}

// --- 统计 ---

export interface DateCount {
  date: string;
  count: number;
}

export interface StatsSummary {
  views: DateCount[];
  adds: DateCount[];
  deletes: DateCount[];
  comments: DateCount[];
}

export interface PopularArticle {
  id: string;
  title: string;
  views: number;
}

export interface PopularComment {
  id: string;
  title: string;
  commentCount: number;
}
