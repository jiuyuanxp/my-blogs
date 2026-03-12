/**
 * 类型定义，以 Java 后端 DTO 为准
 * ID 字段统一为 string，避免 JS 精度丢失
 */

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  children?: Category[];
}

export interface Article {
  id: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  summary?: string;
  content: string;
  status: 'draft' | 'published';
  views: number;
  isPinned?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  content: string;
  createdAt: string;
}
