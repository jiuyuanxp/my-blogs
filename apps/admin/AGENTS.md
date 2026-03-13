# Admin 管理后台（Vite + React）

> 包级 Agent 指引。组织级规范见 [根 AGENTS.md](../../AGENTS.md)。

## 职责

管理后台：登录、文章/分类/评论 CRUD、统计看板。

## 技术栈

- Vite 6、React 19、Tailwind CSS 4
- `@blog/api-client` 发起请求，`@blog/types` 类型定义

## 约定

- **认证**：Token 存 `localStorage`，401 时清除并跳转登录
- **无障碍**：图标按钮 `aria-label`，表单 `label` 或 `aria-label`
- **禁止 `any`**：类型与 Java DTO 同步

## 对接

详见 [apps/admin/docs/INTEGRATION.md](./docs/INTEGRATION.md)。

## 常用命令

```bash
pnpm --filter admin dev    # 开发
pnpm --filter admin build  # 构建
```
