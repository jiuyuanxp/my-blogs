# Admin 对接文档

管理后台与博客服务 API 的对接说明。**接口设计文档在服务端**，本文档仅说明 admin 的对接方式。

## API 文档来源

- **设计文档**：[services/java/docs/api/](../../services/java/docs/api/README.md)
- **Swagger（推荐）**：服务启动后访问 `http://<API_BASE>/swagger-ui.html` 或 `/api-docs`，以 Swagger 为准

## 环境配置

| 变量            | 说明                                      |
| --------------- | ----------------------------------------- |
| `VITE_API_BASE` | 后端 API 地址，如 `http://localhost:4300` |

## 认证

1. 登录：`POST /api/auth/login`，body `{ "password": "xxx" }`，返回 `{ "token": "..." }`
2. Token 存 `localStorage`，请求头带 `Authorization: Bearer <token>`
3. 401 时清除 token 并跳转登录页

## 使用的接口

| 页面       | 接口                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| Login      | POST /api/auth/login, GET /api/auth/check                                     |
| Dashboard  | GET /api/stats/summary, /api/stats/popular-views, /api/stats/popular-comments |
| Articles   | GET/POST/PUT/DELETE /api/articles                                             |
| Categories | GET/POST/PUT/DELETE /api/categories                                           |
| Comments   | GET /api/comments, DELETE /api/comments/:id                                   |

所有管理接口需认证（除 login 外）。
