# Blog Service (Java)

Spring Boot 博客后端服务。

## 运行

项目包含 Maven Wrapper，无需单独安装 Maven：

```bash
# 编译
./mvnw compile

# 推荐：使用脚本加载根目录 .env 后启动（ADMIN_PASSWORD 等会生效）
./run-with-env.sh local      # PostgreSQL
./run-with-env.sh local-h2   # H2 内存库

# 或手动传入环境变量
ADMIN_PASSWORD=你的密码 SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run

# 直接启动（不加载 .env，密码为默认 admin）
SPRING_PROFILES_ACTIVE=local-h2 ./mvnw spring-boot:run
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

> **注意**：Java 不会自动读取 `.env`。若在根目录 `.env` 中配置了 `ADMIN_PASSWORD`，请用 `./run-with-env.sh` 启动，或手动 `export ADMIN_PASSWORD=xxx` 后再运行。

## 环境

- Java 21
- **local-h2**：H2 内存库，无需任何外部服务
- **local**：PostgreSQL（localhost:5433/blogdb，宿主机 5433 映射容器 5432）
- Redis 可选（local/dev 已排除）

## API 文档

启动后访问（Knife4j 增强 UI）：

- **文档页面**: http://localhost:4300/doc.html
- OpenAPI JSON: http://localhost:4300/v3/api-docs
