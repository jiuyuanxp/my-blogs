# 博客管理后台 (admin)

博客系统的管理端前端，用于内容管理、分类管理、评论管理与数据统计。

## 技术栈

| 技术           | 版本 | 说明          |
| -------------- | ---- | ------------- |
| React          | 19   | UI 框架       |
| TypeScript     | 5    | 类型安全      |
| Vite           | 6    | 构建工具      |
| Tailwind CSS   | 4    | 样式          |
| Recharts       | 3    | 图表          |
| Lucide React   | -    | 图标          |
| React Markdown | -    | Markdown 渲染 |

## 项目规范

### 代码风格

- **不可变性**：创建新对象，不原地修改
- **命名**：变量/函数见名知意，使用 `camelCase`
- **文件**：单文件 < 800 行，按功能组织
- **函数**：单一职责，< 50 行

### 设计规范

遵循 [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) 与 [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/vercel-react-best-practices)：

- **无障碍**：图标按钮需 `aria-label`，表单控件需 `label` 或 `aria-label`
- **焦点**：交互元素需可见 focus 状态（`focus-visible:ring-*`）
- **动画**：尊重 `prefers-reduced-motion`
- **排版**：使用 `…` 而非 `...`，数字列使用 `tabular-nums`
- **内容**：长文本使用 `truncate`/`line-clamp`，空状态需处理

### 性能实践 (Vercel React)

- `async-parallel`：独立请求用 `Promise.all()`
- `bundle-dynamic-imports`：重组件用 `React.lazy`/`next/dynamic`
- `rerender-memo`：昂贵计算提取到 `useMemo`/`memo`
- `server-cache-react`：若接入服务端，使用 `React.cache()` 去重

### 目录结构

```
apps/admin/
├── src/
│   ├── lib/           # 工具与 mock 数据
│   ├── pages/         # 页面组件
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   └── api/           # API 设计文档（预留）
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 设计说明

### 视觉

- **色彩**：纯黑 `#0a0a0a`、暖白 `#fcfcfc`、中性灰、强调蓝
- **字体**：Playfair Display（标题）、Inter（正文）、JetBrains Mono（数据）
- **圆角**：`rounded-2xl` 大圆角
- **对比**：侧边栏深色、主内容浅色

### 页面

| 页面     | 路径 | 说明                         |
| -------- | ---- | ---------------------------- |
| 登录     | -    | 密码登录（演示模式任意密码） |
| 仪表盘   | -    | KPI 卡片、趋势图、热门排行   |
| 分类管理 | -    | 树形分类 CRUD                |
| 文章管理 | -    | 列表、筛选、编辑/预览        |
| 评论管理 | -    | 列表、按分类筛选             |
| 设计规范 | -    | 色彩、排版、组件             |
| 项目说明 | -    | 技术栈与设计理念             |

### 当前状态

- 仅静态页面，使用 `src/lib/mock-data.ts` 模拟数据
- 登录为演示模式，任意密码即可进入
- API 设计目录：`docs/api/`，含接口规划与认证占位

## 快速命令

```bash
pnpm install
pnpm dev        # 开发 http://localhost:4001
pnpm build      # 构建（默认 basePath /admin/，产物在 dist/）
pnpm preview    # 预览构建结果
```

## 相关 Skills

- [web-design-guidelines](https://github.com/vercel-labs/web-interface-guidelines) - UI 审查
- [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/vercel-react-best-practices) - React 性能
