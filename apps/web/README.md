# 博客前台 (web)

博客系统的读者端前端，用于文章浏览、分类筛选、评论展示与发表。

## 技术栈

| 技术               | 版本 | 说明          |
| ------------------ | ---- | ------------- |
| Next.js            | 16   | 全栈框架      |
| React              | 19   | UI 框架       |
| TypeScript         | 5    | 类型安全      |
| Tailwind CSS       | 4    | 样式          |
| next-intl          | 4    | 国际化        |
| React Markdown     | 10   | Markdown 渲染 |
| remark-gfm         | -    | GFM 扩展      |
| rehype-highlight   | -    | 代码高亮      |
| Motion             | 12   | 动画          |
| Lucide React       | -    | 图标          |

## 详细设计

### 架构

- **App Router**：`app/[locale]/` 按语言路由
- **SSR/SSG**：服务端渲染，支持静态生成
- **数据**：当前使用 `src/data/mock.ts` 模拟，待对接 Java 后端 API

### 视觉规范

| 元素     | 规范 |
| -------- | ---- |
| 主色     | stone 灰阶、indigo 强调 |
| 深色模式 | `dark:` 前缀，跟随系统/用户偏好 |
| 字体     | serif（标题）、sans（正文）、mono（数据/代码） |
| 主题色   | `themeColor` 随 light/dark 切换 |

### 国际化

- **语言**：`zh`（中文）、`en`（英文）
- **路由**：`/[locale]/` 前缀，如 `/zh/`、`/en/article/1`
- **文案**：`messages/zh.json`、`messages/en.json`
- **日期**：`date-fns` + `zhCN`/`enUS` locale

### SEO

- **Metadata**：title、description、keywords、Open Graph、Twitter Card
- **sitemap.xml**：首页、文章、分类按 locale 生成
- **robots.txt**：允许 `/`，禁止 `/api/`、`/_next/`、`/admin/`
- **canonical**：alternates.canonical

### 响应式

- 断点：sm/md/lg
- 侧边栏：大屏固定、小屏折叠为下拉按钮
- 图片：`loading="lazy"`，首屏 `fetchpriority="high"`

---

## 功能清单

### 1. 首页 `/[locale]/`

| 功能       | 说明 |
| ---------- | ---- |
| 文章列表   | 卡片展示：分类、日期、标题、摘要 |
| 分类筛选   | 左侧树形分类，支持多级（如 `Tech/Web`） |
| 置顶       | `is_pinned` 文章置顶显示，带 Pin 标签 |
| 排序       | 置顶优先，其次按创建时间倒序 |
| 空状态     | 无文章时提示「该分类下暂无文章」 |
| 移动端     | 分类侧栏折叠为按钮，点击展开 |

### 2. 文章详情 `/[locale]/article/[id]`

| 功能       | 说明 |
| ---------- | ---- |
| 标题/元信息 | 分类链接、发布日期 |
| 正文       | Markdown 渲染，GFM + 代码高亮（highlight.js atom-one-dark） |
| 评论区     | 评论列表 + 发表评论（待实现表单） |
| 返回       | 大屏左侧悬浮按钮、小屏顶部链接 |

### 3. 分类页 `/[locale]/category/[category]`

| 功能       | 说明 |
| ---------- | ---- |
| 标题       | 分类名 + 副标题 |
| 文章网格   | 2 列卡片，标题、摘要、分类、日期 |
| 空状态     | 该分类下暂无文章 |

### 4. 布局与全局

| 功能       | 说明 |
| ---------- | ---- |
| 头部       | 品牌链接、深色模式切换、语言切换 |
| 深色模式   | ThemeProvider，localStorage 持久化 |
| 语言切换   | zh/en 切换，保持当前路径 |
| 页脚       | 版权信息 |
| 动画       | Motion 入场动画 |

### 5. 分类树组件

| 功能       | 说明 |
| ---------- | ---- |
| 树形结构   | 支持 `Tech/Web` 等多级路径 |
| 展开/收起  | 有子节点可展开，AnimatePresence 过渡 |
| 选中       | 高亮当前分类 |
| 图标       | Folder/FolderOpen（有子）、Hash（叶子） |

---

## 目录结构

```
apps/web/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # 首页
│   │   │   ├── article/[id]/page.tsx
│   │   │   └── category/[category]/page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── CategoryTree.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── SetHtmlLang.tsx
│   ├── data/
│   │   └── mock.ts
│   ├── i18n/
│   │   └── request.ts
│   ├── types.ts
│   └── proxy.ts
├── messages/
│   ├── zh.json
│   └── en.json
├── docs/
│   ├── DESIGN.md
│   └── INTEGRATION.md
├── package.json
├── next.config.ts
└── README.md
```

---

## API 对接

| 页面     | 接口 |
| -------- | ---- |
| 首页/分类 | GET /api/articles, GET /api/categories |
| 文章详情 | GET /api/articles/:id |
| 评论     | GET /api/comments?articleId=, POST /api/comments |

环境变量：`NEXT_PUBLIC_API_BASE`（如 `http://localhost:4300`）。详见 [docs/INTEGRATION.md](./docs/INTEGRATION.md)。

---

## 评论作者

- 前端随机生成昵称（如 `User_xxxx`）
- 可修改，存 `localStorage` key: `blog_comment_author`
- 发表评论时读取，若无则生成并写入

---

## 环境变量

| 变量 | 说明 |
| ---- | ---- |
| NEXT_PUBLIC_API_BASE | 后端 API 地址 |
| NEXT_PUBLIC_SITE_URL | 站点 URL |
| NEXT_PUBLIC_SITE_NAME | 站点名称 |
| NEXT_PUBLIC_SITE_DESCRIPTION | 站点描述 |
| NEXT_PUBLIC_BASE_PATH | 部署路径（如 `/web`） |
| NEXT_PUBLIC_OG_IMAGE | Open Graph 图片 |
| GOOGLE_VERIFICATION_CODE | Google 站长验证 |

---

## 快速命令

```bash
pnpm install
pnpm dev        # 开发 http://localhost:3000
pnpm build      # 构建
pnpm start      # 生产预览
```

---

## 相关规范

- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/vercel-react-best-practices)
- [next-intl](https://next-intl-docs.vercel.app/)
