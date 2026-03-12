# API 设计文档

本目录存放博客服务 API 设计文档，为服务端实现的契约来源。设计遵循 api-design 规范。

**文档生成**：项目已集成 Knife4j（基于 OpenAPI 3），启动后访问 `/doc.html` 获取可交互文档，OpenAPI JSON 见 `/v3/api-docs`。

## 设计决策汇总

| 决策项       | 选择       | 说明                                       |
| ------------ | ---------- | ------------------------------------------ |
| 分类返回格式 | 树形       | `GET /api/categories` 返回嵌套 `children`  |
| 认证方案     | 简单 Token | 固定密码校验，返回随机 token 存 Redis/内存 |
| 评论作者     | 前端生成   | web 端随机生成，可修改，存 localStorage    |
| DTO          | 独立       | Request/Response DTO 与 Entity 分离        |
| 软删除       | 是         | 评论软删除，后台可查看已删评论             |
| 分页         | offset     | `page`, `pageSize`，适合管理后台           |
| 时间格式     | ISO 8601   | `2024-03-01T10:00:00Z` (UTC)               |

## 接口清单

| 模块 | 方法   | 路径                          | 认证  | 说明         |
| ---- | ------ | ----------------------------- | ----- | ------------ |
| 认证 | POST   | `/api/auth/login`             | 否    | 登录         |
| 认证 | GET    | `/api/auth/check`             | 是    | 校验 Token   |
| 认证 | POST   | `/api/auth/logout`            | 是    | 登出（可选） |
| 分类 | GET    | `/api/categories`             | 否    | 获取分类树   |
| 分类 | POST   | `/api/categories`             | 是    | 创建分类     |
| 分类 | PUT    | `/api/categories/:id`         | 是    | 更新分类     |
| 分类 | DELETE | `/api/categories/:id`         | 是    | 删除分类     |
| 文章 | GET    | `/api/articles`               | 否/是 | 列表         |
| 文章 | POST   | `/api/articles`               | 是    | 创建         |
| 文章 | GET    | `/api/articles/:id`           | 否    | 详情         |
| 文章 | PUT    | `/api/articles/:id`           | 是    | 更新         |
| 文章 | DELETE | `/api/articles/:id`           | 是    | 删除         |
| 评论 | GET    | `/api/comments`               | 是    | 列表         |
| 评论 | POST   | `/api/comments`               | 否    | 发表评论     |
| 评论 | DELETE | `/api/comments/:id`           | 是    | 软删除       |
| 统计 | GET    | `/api/stats/summary`          | 是    | 统计摘要     |
| 统计 | GET    | `/api/stats/popular-views`    | 是    | 热门浏览     |
| 统计 | GET    | `/api/stats/popular-comments` | 是    | 热门评论     |

## 通用规范

### 请求

- Content-Type: `application/json`
- 认证: `Authorization: Bearer <token>`

### 成功响应

- 单资源: 直接返回对象
- 列表: `{ "data": [...], "meta": { "total", "page", "pageSize", "totalPages" } }`

### 错误响应

```json
{
  "error": {
    "code": "validation_error",
    "message": "请求校验失败",
    "details": [{ "field": "title", "message": "标题不能为空", "code": "required" }]
  }
}
```

### 分页

- 参数: `page`（从 1 起）、`pageSize`（默认 20，最大 100）
- 响应 meta: `total`, `page`, `pageSize`, `totalPages`

## 详细设计

- [认证 API](./auth.md)
- [分类 API](./categories.md)
- [文章 API](./articles.md)
- [评论 API](./comments.md)
- [统计 API](./stats.md)
