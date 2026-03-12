/**
 * Web 前台 API 客户端
 * 遵循 api-design：结构化错误、超时、错误码透传
 * 以 Java 后端字段为准（camelCase），ID 统一为 string 避免精度丢失
 */

import { createClient, normalizeIds, isApiError } from '@blog/api-client';

export { isApiError };

const API_BASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) || 'http://localhost:4300';

const api = createClient({
  baseUrl: API_BASE,
  defaultTimeout: 10000,
});

function normalizeList<T extends object>(arr: T[]): T[] {
  return arr.map((item) => normalizeIds(item));
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

// --- Articles ---

export interface Article {
  id: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  summary?: string;
  content: string;
  status: string;
  views: number;
  isPinned: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function fetchArticles(params?: {
  categoryId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PageResponse<Article>> {
  const q = new URLSearchParams();
  if (params?.categoryId) q.set('categoryId', params.categoryId);
  if (params?.status) q.set('status', params.status ?? 'published');
  if (params?.page) q.set('page', String(params.page ?? 1));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize ?? 20));
  const res = await api.get<PageResponse<Article>>(`/api/articles?${q}`);
  return { ...res, data: normalizeList(res.data) };
}

export async function fetchArticle(id: string, incrementView = false): Promise<Article> {
  const res = await api.get<Article>(`/api/articles/${id}?incrementView=${incrementView}`);
  return normalizeIds(res);
}

// --- Comments ---

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export async function fetchCommentsByArticle(articleId: string): Promise<Comment[]> {
  const res = await api.get<Comment[]>(`/api/comments?articleId=${articleId}`);
  return Array.isArray(res) ? normalizeList(res) : [];
}

export async function createComment(data: {
  articleId: string;
  authorName: string;
  content: string;
}): Promise<Comment> {
  const res = await api.post<Comment>('/api/comments', {
    ...data,
    articleId: Number(data.articleId),
  });
  return normalizeIds(res);
}
