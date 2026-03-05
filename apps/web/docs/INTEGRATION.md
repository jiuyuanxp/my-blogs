# Web 对接文档

博客前台与博客服务 API 的对接说明。**接口设计文档在服务端**，本文档仅说明 web 的对接方式。

## API 文档来源

- **设计文档**：[services/java/docs/api/](../../services/java/docs/api/README.md)
- **Swagger（推荐）**：服务启动后访问 `http://<API_BASE>/swagger-ui.html` 或 `/api-docs`，以 Swagger 为准

## 环境配置

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_API_BASE` | 后端 API 地址，如 `http://localhost:4300` |

## 使用的接口（均公开，无需认证）

| 页面 | 接口 |
|------|------|
| 首页 / 分类页 | GET /api/articles, GET /api/categories |
| 文章详情 | GET /api/articles/:id |
| 评论列表 | GET /api/comments?articleId=xxx |
| 发表评论 | POST /api/comments |

## 评论作者

- 前端随机生成昵称（如 `User_xxxx`），用户可修改
- 存 `localStorage` key: `blog_comment_author`
- 发表评论时从 localStorage 读取 `authorName`，若无则生成并写入
