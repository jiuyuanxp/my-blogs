# 参考：与外部规范的对齐要点

撰写或审查抽取决策时，可对照下列条目（非每次全文阅读，按需查阅）。

## Web Interface Guidelines（Vercel）

来源：执行评审前可拉取最新 `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`。

与**拆分组件**强相关的条目：

- 复合控件、对话框、表单分组：单独组件更易满足 **label / aria-\***、**focus-visible**、**aria-live / aria-busy**
- 模态/全屏：**overscroll-behavior**、**safe-area**、**touch-manipulation**
- 列表/表格：语义化表格、`scope`、长文案 **truncate / break-words / min-w-0**

## Vercel React Best Practices（摘要）

与**是否抽文件、是否懒加载**强相关的前缀：

- **bundle-\***：`lazy` / 条件加载 / 避免列表页同步拉重包
- **rerender-\***：`memo`、`useDeferredValue`、`startTransition`、避免在 render 中做重计算
- **rendering-\***：大列表考虑虚拟化或 `content-visibility`（与本项目表格规模按需）

## 本仓库硬约束（摘录）

- Admin：`aria-label`、`@blog/api-client`、禁止无类型 `any`（见 `apps/admin/AGENTS.md`）
- Web：Server Component 优先、`next/image`、Tailwind（见 `.cursorrules`）
- DTO 字段 camelCase 一致，勿在边界随意改名
