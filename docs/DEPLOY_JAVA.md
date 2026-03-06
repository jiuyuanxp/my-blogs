# Java 服务部署文档

本文档说明如何将博客 Java 后端（Spring Boot）部署到服务器，与 [DEPLOY.md](./DEPLOY.md) 中的 Nginx + web 架构集成。

## 一、架构说明

### 1.1 服务依赖

Java 服务依赖：

| 服务 | 用途 | 默认端口 |
|------|------|----------|
| PostgreSQL | 文章、分类、评论等持久化 | 5432 |
| Redis | Token 存储、可选缓存 | 6379 |

### 1.2 部署后架构

```
                    阿里云 2C2G 轻量服务器
    ┌─────────────────────────────────────────────────────┐
    │                                                       │
    │   用户请求 (IP:80)                                     │
    │        │                                               │
    │        ▼                                               │
    │   ┌─────────────┐                                      │
    │   │   nginx     │  :80                                 │
    │   └──────┬──────┘                                      │
    │          │                                              │
    │    ┌─────┼─────┬─────────────┐                         │
    │    │     │     │             │                          │
    │    ▼     ▼     ▼             ▼                          │
    │  /admin /web  /api/*     (静态)                         │
    │    │     │     │                                        │
    │    │     │     └── 反向代理 → Java :4300                │
    │    │     │                    │                          │
    │    │     │                    ├── PostgreSQL :5432       │
    │    │     │                    └── Redis :6379           │
    │    │     └── Next.js :3000                              │
    │    └── 静态文件                                           │
    └─────────────────────────────────────────────────────┘
```

### 1.3 API 路由

| 路径 | 处理方式 |
|------|----------|
| `/api/*` | 反向代理到 Java 容器（Spring Boot :4300） |
| `/api/auth/login` | 登录 |
| `/api/articles` | 文章 CRUD |
| `/api/categories` | 分类管理 |
| `/api/comments` | 评论 |
| `/doc.html` | Knife4j API 文档 |

---

## 二、前置要求

### 2.1 服务器

- 阿里云轻量应用服务器 2C2G 或以上（建议 2C4G，因需运行 PostgreSQL + Redis + Java）
- 系统：Ubuntu 24.04 LTS
- 已安装 Docker、Docker Compose（见 [DEPLOY.md#3.1](./DEPLOY.md#三服务器初始化首次部署)）

### 2.2 环境变量（敏感信息）

以下变量含敏感信息，建议通过 `.env` 或服务器环境配置，**不要提交到 Git**：

| 变量 | 说明 | 示例 |
|------|------|------|
| `DB_PASSWORD` | PostgreSQL 密码 | 强密码 |
| `ADMIN_PASSWORD` | 管理后台登录密码 | 强密码 |
| `REDIS_PASSWORD` | Redis 密码（可选） | 空表示无密码 |

---

## 三、Docker 镜像构建

### 3.1 本地构建（调试用）

```bash
# 在项目根目录执行
docker build -f infra/docker/Dockerfile.java -t blogs-java:latest .
```

Mac（Apple Silicon）构建 amd64 会走 QEMU 模拟，耗时长，建议使用 GitHub Actions。

### 3.2 GitHub Actions 构建（推荐）

在 `.github/workflows/build-push-acr.yml` 中增加 Java 镜像构建任务（见下文「六、CI 配置」）。

推送代码到 `main` 后，CI 自动构建并推送到阿里云 ACR。

---

## 四、Docker Compose 编排

### 4.1 完整编排示例

在 `infra/docker/docker-compose.yml` 中增加以下服务（或新建 `docker-compose.java.yml` 单独编排）：

```yaml
services:
  # 现有 nginx、web 保持不变...

  postgres:
    image: postgres:16-alpine
    container_name: blogs-postgres
    environment:
      POSTGRES_DB: blogdb
      POSTGRES_USER: bloguser
      POSTGRES_PASSWORD: ${DB_PASSWORD:blogpass}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bloguser -d blogdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: blogs-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  java:
    image: blogs-java:latest
    container_name: blogs-java
    environment:
      SPRING_PROFILES_ACTIVE: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: blogdb
      DB_USER: bloguser
      DB_PASSWORD: ${DB_PASSWORD:blogpass}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:admin}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
```

### 4.2 Nginx 配置

在 `infra/nginx/nginx.conf` 中增加 `/api` 反向代理：

```nginx
# 在 location /web 之前或之后添加
location /api/ {
    proxy_pass http://java:4300;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# API 文档（可选，生产环境可关闭）
location /doc.html {
    proxy_pass http://java:4300;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
location /v3/api-docs {
    proxy_pass http://java:4300;
    proxy_set_header Host $host;
}
```

---

## 五、服务器部署步骤

### 5.1 首次部署

```bash
# 1. SSH 登录服务器
ssh root@你的服务器IP

# 2. 登录 ACR（若使用 GitHub Actions 构建）
docker login crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com

# 3. 拉取 Java 镜像
docker pull crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com/jiuyaun/blogs-java:latest
docker tag crpi-znbxd9etb7oxa8ft.cn-chengdu.personal.cr.aliyuncs.com/jiuyaun/blogs-java:latest blogs-java:latest

# 4. 创建 .env 文件（敏感信息）
cd ~/blogs
cat > .env << 'EOF'
DB_PASSWORD=你的PostgreSQL强密码
ADMIN_PASSWORD=你的管理后台密码
EOF
chmod 600 .env

# 5. 上传 docker-compose 和 nginx 配置
# 从本机执行：scp infra/docker/docker-compose.yml root@服务器IP:~/blogs/
# 从本机执行：scp infra/nginx/nginx.conf root@服务器IP:~/blogs/

# 6. 启动
docker compose up -d

# 7. 验证
docker compose ps
curl http://localhost/api/categories
```

### 5.2 更新部署

```bash
# 拉取新镜像并重启
docker compose pull
docker compose up -d
```

### 5.3 常用命令

```bash
# 查看 Java 日志
docker compose logs -f java

# 查看健康状态
curl http://localhost/actuator/health  # 需在 nginx 中配置 /actuator 代理

# 进入 PostgreSQL
docker compose exec postgres psql -U bloguser -d blogdb
```

---

## 六、CI 配置（GitHub Actions）

在 `.github/workflows/build-push-acr.yml` 中增加 Java 构建任务：

```yaml
# 在 paths-filter 中增加 java 路径
filters: |
  web: ...
  admin: ...
  java:
    - "services/java/**"
    - "infra/docker/Dockerfile.java"

# 在 changes.outputs 中增加
outputs:
  java: ${{ steps.filter.outputs.java }}

# 新增 build-java job
build-java:
  needs: changes
  if: github.event_name == 'workflow_dispatch' || needs.changes.outputs.java == 'true'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to ACR
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}

    - name: Build and push java
      uses: docker/build-push-action@v6
      with:
        context: .
        file: infra/docker/Dockerfile.java
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/blogs-java:${{ env.IMAGE_TAG }}
          ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/blogs-java:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

---

## 七、环境变量一览

| 变量 | 默认 | 说明 |
|------|------|------|
| `SPRING_PROFILES_ACTIVE` | production | 激活的 Spring 配置 |
| `DB_HOST` | postgres | PostgreSQL 主机 |
| `DB_PORT` | 5432 | PostgreSQL 端口 |
| `DB_NAME` | blogdb | 数据库名 |
| `DB_USER` | bloguser | 数据库用户 |
| `DB_PASSWORD` | blogpass | 数据库密码（**必须修改**） |
| `REDIS_HOST` | localhost | Redis 主机 |
| `REDIS_PORT` | 6379 | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `ADMIN_PASSWORD` | admin | 管理后台密码（**必须修改**） |
| `TOKEN_TTL_HOURS` | 168 | Token 有效期（小时） |
| `LOG_LEVEL` | INFO | 日志级别 |

---

## 八、故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 502 on /api/* | Java 容器未启动或崩溃 | `docker compose logs java` |
| 数据库连接失败 | PostgreSQL 未就绪或密码错误 | 检查 `depends_on`、`.env` |
| Redis 连接失败 | Redis 未启动 | `docker compose logs redis` |
| 内存不足 OOM | 2C2G 运行多服务 | 升级到 2C4G，或为各容器设置 `mem_limit` |

---

## 九、相关文档

| 文档 | 说明 |
|------|------|
| [DEPLOY.md](./DEPLOY.md) | 主部署文档（Nginx + web） |
| [DEPLOY_ACR_COMMANDS.md](./DEPLOY_ACR_COMMANDS.md) | ACR 拉取命令（本地使用） |
| [REDIS_DEPLOY.md](./REDIS_DEPLOY.md) | Redis 部署说明 |
