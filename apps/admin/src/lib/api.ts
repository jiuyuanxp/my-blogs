/**
 * Admin API 客户端
 * 遵循 api-design：结构化错误、超时、错误码透传
 * 以 Java 后端字段为准（camelCase），ID 统一为 string 避免精度丢失
 */

import { createClient, ApiError, isApiError, normalizeIds } from '@blog/api-client';

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE) ||
  'http://localhost:4300';

const TOKEN_KEY = 'admin-token';

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export { ApiError, isApiError };

const api = createClient({
  baseUrl: API_BASE,
  getToken,
  onUnauthorized: clearToken,
  defaultTimeout: 10000,
});

function normalizeList<T extends object>(arr: T[]): T[] {
  return arr.map((item) => normalizeIds(item));
}

// --- Auth ---

export interface MeResponse {
  id: number;
  username: string;
  nickname: string;
  role: string;
  permissions: string[];
}

export async function login(
  username: string,
  password: string,
  rememberMe?: boolean
): Promise<{ token: string }> {
  return api.post<{ token: string }>('/api/auth/login', {
    username,
    password,
    rememberMe: rememberMe ?? false,
  });
}

export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me');
}

export async function checkAuth(): Promise<boolean> {
  try {
    await api.get<{ valid: boolean }>('/api/auth/check');
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } finally {
    clearToken();
  }
}

// --- Categories ---

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  children?: Category[];
}

function normalizeCategory(c: Category): Category {
  return {
    ...normalizeIds(c),
    children: c.children?.map(normalizeCategory),
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const list = await api.get<Category[]>('/api/categories');
  return list.map(normalizeCategory);
}

export async function createCategory(name: string, parentId: string | null): Promise<Category> {
  const body = parentId ? { name, parentId: Number(parentId) } : { name, parentId: null };
  const res = await api.post<Category>('/api/categories', body);
  return normalizeIds(res);
}

export async function updateCategory(
  id: string,
  name: string,
  parentId: string | null
): Promise<Category> {
  const res = await api.put<Category>(`/api/categories/${id}`, {
    name,
    parentId: parentId ? Number(parentId) : null,
  });
  return normalizeIds(res);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/categories/${id}`);
}

// --- Articles ---

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

export interface PageResponse<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function fetchArticles(params?: {
  categoryId?: string;
  status?: string;
  all?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<PageResponse<Article>> {
  const q = new URLSearchParams();
  if (params?.categoryId) q.set('categoryId', params.categoryId);
  if (params?.status) q.set('status', params.status ?? '');
  if (params?.all) q.set('all', 'true');
  if (params?.page) q.set('page', String(params.page));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize ?? 20));
  const res = await api.get<PageResponse<Article>>(`/api/articles?${q}`);
  return { ...res, data: normalizeList(res.data) };
}

export async function fetchArticle(id: string): Promise<Article> {
  const res = await api.get<Article>(`/api/articles/${id}`);
  return normalizeIds(res);
}

export async function createArticle(data: {
  categoryId: string;
  title: string;
  summary?: string;
  content: string;
  status?: string;
  isPinned?: number;
}): Promise<Article> {
  const res = await api.post<Article>('/api/articles', {
    ...data,
    categoryId: Number(data.categoryId),
  });
  return normalizeIds(res);
}

export async function updateArticle(
  id: string,
  data: Partial<{
    categoryId: string;
    title: string;
    summary: string;
    content: string;
    status: string;
    isPinned: number;
  }>
): Promise<Article> {
  const body = { ...data };
  if (data?.categoryId !== undefined) {
    (body as Record<string, unknown>).categoryId = Number(data.categoryId);
  }
  const res = await api.put<Article>(`/api/articles/${id}`, body);
  return normalizeIds(res);
}

export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/api/articles/${id}`);
}

// --- Comments ---

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export async function fetchComments(params?: {
  articleId?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PageResponse<Comment>> {
  const q = new URLSearchParams();
  if (params?.articleId) q.set('articleId', params.articleId);
  if (params?.categoryId) q.set('categoryId', params.categoryId ?? '');
  if (params?.page) q.set('page', String(params.page ?? 1));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize ?? 20));
  const res = await api.request<PageResponse<Comment> | Comment[]>(`/api/comments?${q}`, {
    method: 'GET',
  });
  const list = Array.isArray(res) ? res : res.data;
  const normalized = normalizeList(list);
  if (Array.isArray(res)) {
    return {
      data: normalized,
      meta: {
        total: normalized.length,
        page: 1,
        pageSize: normalized.length,
        totalPages: 1,
      },
    };
  }
  return { ...res, data: normalized };
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/api/comments/${id}`);
}

// --- Stats ---

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

export async function fetchStatsSummary(
  period: 'day' | 'month' | 'year' = 'day'
): Promise<StatsSummary> {
  return api.get<StatsSummary>(`/api/stats/summary?period=${period}`);
}

export async function fetchPopularViews(limit = 10): Promise<PopularArticle[]> {
  const list = await api.get<PopularArticle[]>(`/api/stats/popular-views?limit=${limit}`);
  return normalizeList(list);
}

export async function fetchPopularComments(limit = 10): Promise<PopularComment[]> {
  const list = await api.get<PopularComment[]>(`/api/stats/popular-comments?limit=${limit}`);
  return normalizeList(list);
}

// --- Users ---

export interface User {
  id: string;
  username: string;
  nickname?: string;
  roleCode: string;
  roleName: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export async function fetchUsers(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PageResponse<User>> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize ?? 20));
  const res = await api.get<PageResponse<User>>(`/api/users?${q}`);
  return { ...res, data: normalizeList(res.data) };
}

export async function fetchUser(id: string): Promise<User> {
  const res = await api.get<User>(`/api/users/${id}`);
  return normalizeIds(res);
}

export async function createUser(data: {
  username: string;
  password: string;
  nickname?: string;
  roleId: string;
}): Promise<User> {
  const res = await api.post<User>('/api/users', {
    ...data,
    roleId: Number(data.roleId),
  });
  return normalizeIds(res);
}

export async function updateUser(
  id: string,
  data: Partial<{ nickname: string; roleId: string; status: string }>
): Promise<User> {
  const body = { ...data };
  if (data?.roleId !== undefined) {
    (body as Record<string, unknown>).roleId = Number(data.roleId);
  }
  const res = await api.put<User>(`/api/users/${id}`, body);
  return normalizeIds(res);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  await api.post(`/api/users/${id}/reset-password`, { newPassword });
}

// --- Roles ---

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export async function fetchRoles(): Promise<Role[]> {
  const list = await api.get<Role[]>('/api/roles');
  return normalizeList(list);
}

export async function fetchRole(id: string): Promise<Role> {
  const res = await api.get<Role>(`/api/roles/${id}`);
  return normalizeIds(res);
}

export async function createRole(data: {
  code: string;
  name: string;
  description?: string;
}): Promise<Role> {
  const res = await api.post<Role>('/api/roles', data);
  return normalizeIds(res);
}

export async function updateRole(
  id: string,
  data: Partial<{ name: string; description: string }>
): Promise<Role> {
  const res = await api.put<Role>(`/api/roles/${id}`, data);
  return normalizeIds(res);
}

export async function assignRolePermissions(id: string, permissionIds: string[]): Promise<void> {
  await api.put(`/api/roles/${id}/permissions`, {
    permissionIds: permissionIds.map(Number),
  });
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/api/roles/${id}`);
}

// --- Permissions ---

export interface Permission {
  id: string;
  code: string;
  name: string;
  type: 'menu' | 'button';
  parentId?: string | null;
  sortOrder: number;
  children?: Permission[];
  createdAt?: string;
}

export async function fetchPermissions(type?: 'menu' | 'button'): Promise<Permission[]> {
  const q = type ? `?type=${type}` : '';
  const list = await api.get<Permission[]>(`/api/permissions${q}`);
  return normalizeList(list);
}

export async function createPermission(data: {
  code: string;
  name: string;
  type?: 'menu' | 'button';
  parentId?: number;
  sortOrder?: number;
}): Promise<Permission> {
  const res = await api.post<Permission>('/api/permissions', data);
  return normalizeIds(res);
}

export async function updatePermission(
  id: string,
  data: Partial<{ name: string; type: string; parentId?: number; sortOrder: number }>
): Promise<Permission> {
  const res = await api.put<Permission>(`/api/permissions/${id}`, data);
  return normalizeIds(res);
}

export async function deletePermission(id: string): Promise<void> {
  await api.delete(`/api/permissions/${id}`);
}
