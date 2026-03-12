# Blog Service 设计说明

Java Spring Boot 博客后端服务设计文档。实现时参考 springboot-patterns 与 api-design 技能。

## 架构

### 分层

```
Controller → Service → Repository → Database
     ↓           ↓
   DTO      Entity
```

- **Controller**：参数校验、调用 Service、返回 DTO
- **Service**：业务逻辑、事务、编排
- **Repository**：JPA 数据访问
- **DTO**：Request/Response 与 Entity 分离

### 模块划分

```
com.blog
├── auth/           # 认证（Token 校验、登录）
├── category/       # 分类
├── article/        # 文章
├── comment/        # 评论
└── stats/          # 统计
```

## 设计决策

### 1. DTO 独立

- **Request DTO**：CreateXxxRequest、UpdateXxxRequest
- **Response DTO**：XxxResponse
- Entity 不直接暴露给 API，避免泄露内部字段、便于演进

### 2. 认证

- **简单 Token**：固定密码（环境变量 `ADMIN_PASSWORD`）校验，通过后生成随机 token
- Token 存储：优先 Redis（有则用），否则内存 Map
- Token TTL：可配置（如 7 天）

### 3. 软删除（评论）

- Comment 实体增加 `deletedAt`（LocalDateTime，nullable）
- 删除时设置 `deletedAt`，不物理删除
- 查询时默认 `WHERE deleted_at IS NULL`，admin 可通过参数查含已删

### 4. 分类树形返回

- 存储：邻接表 `parent_id`
- 查询：先查扁平列表，Service 层递归组装树形结构返回

### 5. 错误处理

- `@ControllerAdvice` 全局异常处理
- 统一错误格式：`{ "error": { "code", "message", "details" } }`
- 校验异常 → 400/422，认证失败 → 401，资源不存在 → 404

## 数据模型（Entity）

### Category

- id, parentId, name, createdAt

### Article

- id, categoryId, title, summary, content, status, views, isPinned, createdAt, updatedAt
- status: draft | published

### Comment

- id, articleId, authorName, content, createdAt, deletedAt

## 缓存（可选）

- 若部署 Redis，可对以下做缓存：
  - 分类树 `GET /api/categories`
  - 文章详情 `GET /api/articles/:id`（更新/删除时失效）
- 配置：`@EnableCaching`，`@Cacheable` / `@CacheEvict`
- Redis 部署见 [docs/deploy/REDIS_DEPLOY.md](../../docs/deploy/REDIS_DEPLOY.md)

## 依赖

- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL
- Redis（可选，用于 Token 存储与缓存）
- Lombok、Validation

## API 契约

- **设计文档**：[services/java/docs/api/](./api/README.md)
- **Swagger**：实现时集成 SpringDoc OpenAPI，运行时 `/swagger-ui.html` 或 `/api-docs` 提供可交互文档，前端对接以 Swagger 为准
