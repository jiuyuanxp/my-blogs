import type { Article, Comment } from '@/types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: '微服务架构入门指南',
    summary:
      '从单体应用到微服务的演进之路，包含实际案例分析。探讨服务拆分、通信模式与治理策略。',
    content: `# 微服务架构入门

微服务是一种将应用拆分为一组小型服务的架构风格，每个服务运行在独立进程中。

## 核心概念

- **服务自治**：每个服务可独立部署、扩展
- **去中心化**：数据与治理分散
- **容错设计**：服务间故障隔离

## 实践建议

1. 从单体开始，按业务域逐步拆分
2. 建立统一的 API 网关
3. 引入服务发现与配置中心
`,
    category: 'Architecture',
    is_pinned: 1,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'React 性能优化实践',
    summary:
      '深入探讨 React 应用的性能优化技巧和最佳实践，包括 memo、useMemo、虚拟列表等。',
    content: `# React 性能优化

性能优化是构建流畅用户体验的关键。

## 常用手段

- **React.memo**：避免不必要的重渲染
- **useMemo / useCallback**：缓存计算结果与回调
- **虚拟列表**：长列表按需渲染

## 调试工具

使用 React DevTools Profiler 分析渲染性能。`,
    category: 'Frontend',
    is_pinned: 0,
    created_at: '2024-01-10T14:30:00Z',
  },
  {
    id: 3,
    title: 'Next.js App Router 深度解析',
    summary:
      'App Router 带来的服务端组件、流式渲染与布局系统，如何构建现代化全栈应用。',
    content: `# Next.js App Router

App Router 是 Next.js 13+ 的默认路由系统。

## 核心特性

- **Server Components**：默认服务端渲染
- **Streaming**：流式 HTML 传输
- **Layouts**：共享布局与嵌套路由`,
    category: 'Frontend/Next.js',
    is_pinned: 0,
    created_at: '2024-01-05T09:00:00Z',
  },
  {
    id: 4,
    title: 'PostgreSQL 索引优化指南',
    summary:
      'B-tree、Hash、GIN 等索引类型的选择与使用场景，以及 EXPLAIN 分析查询计划。',
    content: `# PostgreSQL 索引

正确的索引能显著提升查询性能。

## 索引类型

- **B-tree**：默认，适合范围查询
- **Hash**：等值查询
- **GIN**：全文与 JSONB`,
    category: 'Database',
    is_pinned: 0,
    created_at: '2023-12-28T16:00:00Z',
  },
];

export const MOCK_COMMENTS: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      article_id: 1,
      author_name: 'User1234',
      content: '写得很好，期待更多微服务相关文章！',
      created_at: '2024-01-16T10:00:00Z',
    },
  ],
};

export const MOCK_CATEGORIES = [
  'Architecture',
  'Frontend',
  'Frontend/Next.js',
  'Database',
];
