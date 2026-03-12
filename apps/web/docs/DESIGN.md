# Web 前端设计说明

博客前台展示设计文档。开发时需参考 vercel-react-best-practices 与 web-interface-guidelines。

## 设计决策

### 1. 移动端适配

- **不做独立移动端 App**，web 做好响应式即可
- 断点：sm/md/lg，侧边栏小屏折叠、列表单列
- `touch-action: manipulation` 减少双击缩放延迟
- 图片 `loading="lazy"`，首屏 `fetchpriority="high"`

### 2. 评论作者

- **前端随机生成**：首次访问生成随机昵称（如 `User_xxxx`）
- **可修改**：用户可在输入框旁修改，修改后存 `localStorage`
- **存储**：`localStorage` key 如 `blog_comment_author`，持久化供下次使用
- 发表评论时从 localStorage 读取，若无则用随机值并写入

### 3. 数据获取

- 对接 Java 后端 API
- 文章列表、分类、文章详情、评论列表为公开接口
- 发表评论 `POST /api/comments` 为公开接口

### 4. 国际化

- 已有 next-intl，保持 `zh` / `en`
- 日期/数字用 `Intl.DateTimeFormat`、`Intl.NumberFormat`

## 页面与 API 映射

| 页面             | 主要 API                                            |
| ---------------- | --------------------------------------------------- |
| 首页（文章列表） | GET /api/articles, GET /api/categories              |
| 文章详情         | GET /api/articles/:id, GET /api/comments?articleId= |
| 分类页           | GET /api/articles?categoryId=, GET /api/categories  |
| 发表评论         | POST /api/comments                                  |

## 类型定义

与 API 响应一致，camelCase。参见 `apps/admin/docs/api/`。

## 类型对齐（admin vs web）

- admin Article：categoryId, categoryName, status, views, isPinned
- web Article：展示用 categoryName（或从 category 树解析路径），isPinned 用于置顶排序
- 统一以 API 返回为准，前端类型与 API 契约一致
