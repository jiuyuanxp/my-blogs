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
| remark-gfm     | -    | GFM 扩展      |

## 详细设计

### 架构

- **SPA**：单页应用，Tab 切换无刷新
- **状态**：本地 `useState`，认证用 `localStorage`
- **数据**：当前使用 `src/lib/mock-data.ts` 模拟，待对接 Java 后端 API

### 视觉规范

| 元素     | 规范 |
| -------- | ---- |
| 主色     | 纯黑 `#0a0a0a`、暖白 `#fcfcfc` |
| 强调色   | 蓝 `#2563eb` |
| 字体     | Playfair Display（标题）、Inter（正文）、JetBrains Mono（数据） |
| 圆角     | `rounded-2xl` 大圆角 |
| 布局     | 侧边栏深色、主内容浅色，强烈对比 |

### 无障碍

- 图标按钮：`aria-label`
- 表单：`<label>` 或 `aria-label`
- 焦点：`focus-visible:ring-*`
- 装饰图标：`aria-hidden`

### 响应式

- 桌面：固定侧边栏 + 主内容
- 移动：折叠侧栏、汉堡菜单、全屏遮罩

---

## 功能清单

### 1. 登录

| 功能       | 说明 |
| ---------- | ---- |
| 密码输入   | 单字段表单，`type="password"` |
| 演示模式   | 任意密码即可进入（`localStorage` 存 `admin-auth-demo`） |
| 布局       | 左图右表，大屏分栏、小屏单列 |
| 退出       | 清除 token，返回登录页 |

### 2. 仪表盘

| 功能           | 说明 |
| -------------- | ---- |
| KPI 卡片       | 总浏览量、新增文章、新增评论、删除文章 |
| 统计周期       | 按日 / 按月 / 按年切换 |
| 趋势图         | 浏览量（面积图）、新增文章（柱状）、新增评论（面积）、删除文章（柱状） |
| 热门排行       | 浏览量 Top、评论数 Top |
| 图表库         | Recharts（AreaChart、BarChart） |

### 3. 分类管理

| 功能       | 说明 |
| ---------- | ---- |
| 树形展示   | 支持多级嵌套，可展开/收起 |
| 添加       | 根分类、子分类（hover 显示 + 按钮） |
| 编辑       | 行内编辑，Enter 保存 |
| 删除       | `window.confirm` 确认 |
| 空状态     | 无分类时提示「请先创建一个分类」 |

### 4. 文章管理

| 功能       | 说明 |
| ---------- | ---- |
| 列表       | 表格：标题、分类、状态、浏览量、日期、操作 |
| 筛选       | 按根分类 Tab + 子分类下拉 |
| 写文章     | 标题、分类、状态（草稿/已发布）、Markdown 内容 |
| 编辑/预览  | 编辑/预览切换，ReactMarkdown + remarkGfm |
| 编辑/删除  | 行内按钮，删除需确认 |

### 5. 评论管理

| 功能       | 说明 |
| ---------- | ---- |
| 列表       | 评论内容、时间、所属文章 |
| 筛选       | 按分类下拉（当前静态展示全部） |
| 删除       | 单条删除，需确认 |

### 6. 设计规范

| 功能       | 说明 |
| ---------- | ---- |
| 色彩系统   | 纯黑、暖白、中性灰、强调蓝 |
| 排版       | Display/Serif、Body/Sans、Data/Mono |
| 组件       | 卡片、按钮示例 |

### 7. 项目说明

| 功能       | 说明 |
| ---------- | ---- |
| 技术栈     | React、Tailwind、Lucide、Recharts、React Markdown |
| 交互体验   | 响应式、沉浸式编辑、微交互动画、状态反馈 |
| 设计理念   | 内容优先、优雅排版、深浅对比、圆润亲和 |

---

## 目录结构

```
apps/admin/
├── src/
│   ├── lib/
│   │   ├── mock-data.ts    # 模拟数据
│   │   └── utils.ts        # cn() 等工具
│   ├── pages/
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── Categories.tsx  # 分类管理
│   │   ├── Articles.tsx    # 文章管理
│   │   ├── Comments.tsx    # 评论管理
│   │   ├── Login.tsx       # 登录
│   │   ├── DesignSystem.tsx # 设计规范
│   │   └── ProjectInfo.tsx # 项目说明
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── DESIGN.md           # 设计说明
│   └── INTEGRATION.md      # API 对接说明
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## API 对接

| 页面     | 接口 |
| -------- | ---- |
| Login    | POST /api/auth/login, GET /api/auth/check |
| Dashboard| GET /api/stats/summary, popular-views, popular-comments |
| Articles | GET/POST/PUT/DELETE /api/articles |
| Categories | GET/POST/PUT/DELETE /api/categories |
| Comments | GET /api/comments, DELETE /api/comments/:id |

环境变量：`VITE_API_BASE`（如 `http://localhost:4300`）。详见 [docs/INTEGRATION.md](./docs/INTEGRATION.md)。

---

## 快速命令

```bash
pnpm install
pnpm dev        # 开发 http://localhost:4001
pnpm build      # 构建（默认 basePath /admin/，产物在 dist/）
pnpm preview    # 预览构建结果
```

---

## 相关规范

- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) - UI 审查
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/vercel-react-best-practices) - React 性能
