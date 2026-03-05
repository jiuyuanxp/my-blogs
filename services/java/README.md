# Blog Service (Java)

Spring Boot 博客后端服务。

## 运行

项目包含 Maven Wrapper，无需单独安装 Maven：

```bash
# 编译
./mvnw compile

# 启动方式一：H2 内存数据库（无需 PostgreSQL，推荐本地快速验证）
SPRING_PROFILES_ACTIVE=local-h2 ./mvnw spring-boot:run

# 启动方式二：PostgreSQL（需先启动 PostgreSQL）
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# 启动方式三：dev profile（排除 Redis）
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

## 环境

- Java 21
- **local-h2**：H2 内存库，无需任何外部服务
- **local**：PostgreSQL（localhost:5432/blogdb）
- Redis 可选（local/dev 已排除）

## API 文档

启动后访问（Knife4j 增强 UI）：

- **文档页面**: http://localhost:4300/doc.html
- OpenAPI JSON: http://localhost:4300/v3/api-docs
