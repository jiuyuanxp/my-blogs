---
name: react-component-extraction
description: Guides when and where to extract React components and hooks in this monorepo (apps/admin, apps/web), distinguishes page-scoped vs app-wide placement, mandates searching for existing UI before creating new files, and ties decisions to Web Interface Guidelines and Vercel-style React performance. Use when implementing or refactoring admin/web features, splitting large pages, or when the user asks where to put a component, hook, or how to structure a page folder.
---

# React 组件与 Hook 抽取（本仓库）

在写或改 `apps/admin`、`apps/web` 代码前，按下面顺序做一次**轻量决策**，再动手。默认假设 Agent 已具备通用 React 能力，此处只固化**本仓库约定**与**与规范对齐的拆分理由**。

## 1. 是否需要封装（先问再写）

满足**任一**即倾向抽取（组件或 hook，见 §2）：

| 信号            | 说明                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **体积**        | 单文件接近或超过 ~400 行，或单段 JSX 逻辑块重复 2 次以上                                                                                       |
| **职责**        | 同一函数内混杂：数据获取、表单校验、大段展示、副作用                                                                                           |
| **复用**        | 另一页面/路由已存在或即将需要同一 UI 或同一状态机                                                                                              |
| **性能**        | 重依赖（如 markdown、图表、编辑器）仅在部分路由需要 → 适合独立文件 + `lazy`/`Suspense`（见 [reference.md](reference.md) 与 Vercel `bundle-*`） |
| **渲染成本**    | 昂贵子树随父组件高频重渲染 → 抽子组件 + `memo` / `useDeferredValue` / `startTransition`（按场景选）                                            |
| **无障碍/表单** | 独立对话框、复杂复合控件、需稳定 `aria-*` 与焦点的区域 → 单独组件更易做对（Web Interface Guidelines）                                          |

**不必抽**：仅出现一次且 <30 行的展示、无性能/测试压力；抽了反而增加跳转成本。

## 2. 页面私有 vs 全局（放哪）

**页面组件（仅本路由/本页使用）**

- 路径：`apps/admin/src/pages/<PageName>/` 下建业务目录（与当前扁平 `Articles.tsx` 并存即可；新功能或大规模重构时优先采用）。
- 私有 UI：`pages/<PageName>/components/*.tsx`
- 私有 hook：`pages/<PageName>/hooks/use*.ts`（或与 `components` 同目录，二选一保持目录内一致即可）

**全局组件 / 全应用 hooks**

- 条件：**至少两个不同页面**（或 `web` 与 `admin` 若未来共享，再考虑 `packages/`）需要同一 API 与 UI。
- Admin：`apps/admin/src/components/`、`apps/admin/src/hooks/`（若目录不存在则创建）
- Web：`apps/web/src/components/`、`apps/web/src/hooks/`
- **跨应用**可复用且与框架无关：评估 `packages/`（需同步类型与构建，变更成本高，慎用）

**边界不清时**：先放**页面目录**；第二次复用再**上提到** `src/components`（避免过早抽象）。

## 3. 创建前先找现有实现

按顺序搜索，**能复用则不改名造新轮**：

1. 当前页目录：`pages/<Page>/components/`
2. 当前 app：`src/components/`、`src/hooks/`
3. Monorepo：`packages/*`（types、utils、api-client 等）
4. UI 库：Admin 已用 Ant Design、Lucide、Tailwind；勿重复封装已有 primitive

若只有「部分一致」：优先**组合**现有组件 + props，而不是复制粘贴后改名字。

## 4. 如何创建（最小步骤）

1. **命名**：组件 `PascalCase`，hook `use` 前缀；文件名与默认导出一致或 `index.tsx` 再导出。
2. **Props**：类型显式；与后端字段对齐见项目 `.cursorrules` / `packages/types`。
3. **客户端边界**：Next.js 仅在需要交互时 `"use client"`；Admin 多为客户端，保持与现有文件一致。
4. **性能**（与 Vercel React 实践一致，按需选用）：
   - 重包：动态 `import` + `Suspense`
   - 输入驱动昂贵预览：`useDeferredValue` 或 `startTransition`
   - 稳定 props 的纯展示：`memo`
5. **无障碍**（Web Interface Guidelines）：图标按钮 `aria-label`、表单 `label`/`aria-label`、`focus-visible` 可见焦点、模态 `overscroll-behavior`、异步状态 `aria-busy`/`aria-live` 等——抽成组件时在组件边界一次做对。

## 5. 与本文仓库示例对齐

- 全应用级 Markdown 编辑：`apps/admin/src/components/MarkdownSplitEditor.tsx` + `ArticleMarkdownPreview.tsx`（重依赖分包）属于**全局组件**范例。
- 文章页已拆为 `apps/admin/src/pages/Articles/`：`ArticlesPage.tsx`、`hooks/useArticlesPage.ts`、`components/*`；路由仍通过 `pages/Articles.tsx` re-export。
- 多页共用的错误条与加载态：`components/ErrorAlert.tsx`、`components/PageLoading.tsx`（含 `InlineLoading`）、`lib/errorMessage.ts`（`apiErrorMessage`）。

## 6. 输出给用户的说明（可选）

完成抽取后，用一两句话说明：**为何抽**、**为何放在该目录**、**复用了谁**，便于 Code Review。

---

更细的规范索引见 [reference.md](reference.md)。
