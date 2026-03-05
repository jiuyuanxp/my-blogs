import type { Article, Category, Comment } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, parent_id: null, name: '技术', created_at: '2024-01-01' },
  { id: 2, parent_id: 1, name: '前端', created_at: '2024-01-01' },
  { id: 3, parent_id: 1, name: '后端', created_at: '2024-01-01' },
  { id: 4, parent_id: null, name: '随笔', created_at: '2024-01-01' },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    category_id: 2,
    category_name: '前端',
    title: 'Next.js 16 新特性解析',
    content: '# 简介\n\nNext.js 16 带来了诸多改进…',
    status: 'published',
    views: 1280,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-02T15:30:00Z',
  },
  {
    id: 2,
    category_id: 3,
    category_name: '后端',
    title: 'Spring Boot 3 实践指南',
    content: '# 概述\n\nSpring Boot 3 基于 Java 17…',
    status: 'draft',
    views: 0,
    created_at: '2024-03-03T09:00:00Z',
    updated_at: '2024-03-03T09:00:00Z',
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    article_id: 1,
    article_title: 'Next.js 16 新特性解析',
    content: '写得很好，期待更多分享！',
    created_at: '2024-03-02T14:20:00Z',
  },
];

export const MOCK_STATS = {
  views: [
    { date: '2024-03-01', count: 120 },
    { date: '2024-03-02', count: 340 },
    { date: '2024-03-03', count: 180 },
  ],
  adds: [
    { date: '2024-03-01', count: 2 },
    { date: '2024-03-02', count: 1 },
    { date: '2024-03-03', count: 0 },
  ],
  deletes: [
    { date: '2024-03-01', count: 0 },
    { date: '2024-03-02', count: 0 },
    { date: '2024-03-03', count: 0 },
  ],
  comments: [
    { date: '2024-03-01', count: 0 },
    { date: '2024-03-02', count: 1 },
    { date: '2024-03-03', count: 0 },
  ],
};

export const MOCK_POPULAR_VIEWS = [
  { id: 1, title: 'Next.js 16 新特性解析', views: 1280 },
];

export const MOCK_POPULAR_COMMENTS = [
  { id: 1, title: 'Next.js 16 新特性解析', comment_count: 1 },
];
