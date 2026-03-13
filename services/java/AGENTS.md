# Java 博客服务（Spring Boot）

> 包级 Agent 指引。组织级规范见 [根 AGENTS.md](../../AGENTS.md)。

## 职责

后端 API：认证、文章、分类、评论、统计。

## 技术栈

- Java 21、Spring Boot 3.2、JPA、PostgreSQL、Redis
- Knife4j OpenAPI 3：`/doc.html`、`/v3/api-docs`

## 约定

- **分层**：Controller → Service → Repository → Entity
- **DTO 与 Entity 分离**：禁止将 Entity 直接暴露给前端
- **Swagger**：所有 Public API 添加 `@Operation`、`@ApiResponse`
- **异常**：由 `@RestControllerAdvice` 统一处理，格式见 `docs/api-contract.md`

## 设计文档

- [API 设计](docs/api/README.md)
- [数据表设计](docs/SCHEMA_TABLES.md)

## 常用命令

```bash
mvn spring-boot:run -f services/java/pom.xml   # 启动
mvn test -f services/java/pom.xml             # 测试
```

## DTO 变更后

必须同步更新 `docs/api-contract.md`、`services/java/docs/api/`、`packages/types`，并运行 `pnpm typecheck`。
