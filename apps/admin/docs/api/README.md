# API 设计目录

本目录用于存放博客管理后台的 API 设计文档。

## 规划接口

| 模块 | 方法   | 路径                          | 说明                                  |
| ---- | ------ | ----------------------------- | ------------------------------------- | ----- | ------ |
| 认证 | POST   | `/api/auth/login`             | 登录                                  |
| 认证 | GET    | `/api/auth/check`             | 校验 Token                            |
| 认证 | POST   | `/api/auth/logout`            | 登出                                  |
| 分类 | GET    | `/api/categories`             | 获取分类树                            |
| 分类 | POST   | `/api/categories`             | 创建分类                              |
| 分类 | PUT    | `/api/categories/:id`         | 更新分类                              |
| 分类 | DELETE | `/api/categories/:id`         | 删除分类                              |
| 文章 | GET    | `/api/articles`               | 获取文章列表（支持 category_id 筛选） |
| 文章 | POST   | `/api/articles`               | 创建文章                              |
| 文章 | GET    | `/api/articles/:id`           | 获取文章详情                          |
| 文章 | PUT    | `/api/articles/:id`           | 更新文章                              |
| 文章 | DELETE | `/api/articles/:id`           | 删除文章                              |
| 评论 | GET    | `/api/comments`               | 获取评论列表（支持 category_id 筛选） |
| 评论 | DELETE | `/api/comments/:id`           | 删除评论                              |
| 统计 | GET    | `/api/stats/summary`          | 统计摘要（period: day                 | month | year） |
| 统计 | GET    | `/api/stats/popular-views`    | 热门浏览排行                          |
| 统计 | GET    | `/api/stats/popular-comments` | 热门评论排行                          |

## 设计规范

- RESTful 风格
- 统一错误响应格式
- 分页参数：`page`, `pageSize`
- 认证：Bearer Token (Authorization header)

详细设计待补充。
