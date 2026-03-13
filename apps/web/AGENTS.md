# Web 主站（Next.js）

> 包级 Agent 指引。组织级规范见 [根 AGENTS.md](../../AGENTS.md)。

## 职责

博客前台：文章列表、分类、文章详情、评论展示与发表。

## 技术栈

- Next.js 16、React 19、Tailwind CSS 4
- `@blog/api-client` 发起请求，`@blog/types` 类型定义

## 约定

- **Server Component 优先**：仅需 `useState`、`useEffect`、事件、浏览器 API 时使用 `"use client"`
- **禁止 `any`**：类型与 Java DTO 同步
- **样式**：严格 Tailwind，图片用 `next/image`
- **错误处理**：`isApiError(err)` 解析 API 错误

## 对接

详见 [apps/web/docs/INTEGRATION.md](./docs/INTEGRATION.md)。

## 常用命令

```bash
pnpm --filter web dev    # 开发
pnpm --filter web build  # 构建
```
