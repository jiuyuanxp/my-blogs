# 部署规划 (Single Source of Truth)

> 本文档记录 Docker 网络配置、Nginx 转发逻辑及 M1 芯片镜像构建注意点，为所有 Agent 与运维的唯一参考。

## 一、架构概览

```
                    宿主机 (阿里云 2C2G / 本地)
    ┌─────────────────────────────────────────────────────────────────┐
    │                                                                   │
    │   用户请求 (IP:80)                                                │
    │        │                                                           │
    │        ▼                                                           │
    │   ┌─────────────┐                                                 │
    │   │   nginx     │  :80                                            │
    │   │  (blogs-nginx)                                                │
    │   └──────┬──────┘                                                 │
    │          │                                                         │
    │    ┌─────┼─────┬─────────────┐                                    │
    │    │     │     │             │                                     │
    │    ▼     ▼     ▼             ▼                                     │
    │  /admin  /web  /api         postgres / redis                      │
    │  (静态)  (代理) (代理→java)   (数据层)                              │
    │    │     │     │                                                   │
    │    │     │     └── java :4300 (Spring Boot)                        │
    │    │     └── web :3000 (Next.js)                                   │
    │    └── admin 静态文件已打包进 nginx 镜像                             │
    └─────────────────────────────────────────────────────────────────┘
```

## 二、Docker 网络与服务

### 2.1 服务清单

| 服务         | 镜像               | 内部端口 | 宿主机端口 | 说明                       |
| ------------ | ------------------ | -------- | ---------- | -------------------------- |
| **nginx**    | blogs-nginx:latest | 80       | 80         | 入口，反向代理             |
| **web**      | blogs-web:latest   | 3000     | -          | Next.js，仅内网访问        |
| **java**     | blogs-java:latest  | 4300     | -          | Spring Boot，仅内网访问    |
| **postgres** | postgres:16        | 5432     | 5433       | 宿主机 5433 避免与本地冲突 |
| **redis**    | redis:7-alpine     | 6379     | -          | 仅内网                     |

### 2.2 网络

- 使用 `docker compose` 默认网络 `blogs_default`
- 服务间通过**服务名**通信：`web`、`java`、`postgres`、`redis`

### 2.3 数据卷

| 卷名          | 挂载路径                 | 说明             |
| ------------- | ------------------------ | ---------------- |
| postgres-data | /var/lib/postgresql/data | 数据库持久化     |
| redis-data    | /data                    | Redis AOF 持久化 |

### 2.4 环境变量（生产）

| 变量                   | 服务           | 说明                 |
| ---------------------- | -------------- | -------------------- |
| DB_PASSWORD            | postgres, java | 数据库密码           |
| REDIS_PASSWORD         | java           | Redis 密码（若启用） |
| ADMIN_PASSWORD         | java           | 超级管理员初始密码   |
| NODE_ENV               | web            | production           |
| NEXT_PUBLIC_BASE_PATH  | web            | /web                 |
| VITE_BASE_PATH         | admin 构建时   | /admin               |
| SPRING_PROFILES_ACTIVE | java           | production           |

---

## 三、Nginx 转发逻辑

配置文件：`infra/nginx/nginx.conf`（打包进 nginx 镜像）

### 3.1 路由表

| 路径                  | 处理方式   | 目标                                 |
| --------------------- | ---------- | ------------------------------------ |
| `/`                   | 302 重定向 | `/web/zh`                            |
| `/admin`              | 302 重定向 | `/admin/`                            |
| `/admin/`、`/admin/*` | 静态文件   | alias `/usr/share/nginx/html/admin/` |
| `/api/`               | 反向代理   | `http://java:4300`                   |
| `/doc.html`           | 反向代理   | `http://java:4300`（Knife4j）        |
| `/v3/api-docs`        | 反向代理   | `http://java:4300`                   |
| `/webjars/`           | 反向代理   | `http://java:4300`                   |
| `/web`、`/web/*`      | 反向代理   | `http://web:3000`                    |

### 3.2 代理头

所有反向代理均设置：

- `Host $host`
- `X-Real-IP $remote_addr`
- `X-Forwarded-For $proxy_add_x_forwarded_for`
- `X-Forwarded-Proto $scheme`

`/web` 额外支持 WebSocket：

- `Upgrade $http_upgrade`
- `Connection "upgrade"`
- `proxy_cache_bypass $http_upgrade`

### 3.3 Gzip 与缓存

- **Gzip**：对 text/html、application/json、text/css、application/javascript 等启用
- **静态缓存**：`/admin/` 为 `max-age=3600, stale-while-revalidate=86400`；`/_next/static/` 为 `max-age=31536000, immutable`
- **安全 Header**：`X-Content-Type-Options: nosniff`、`X-Frame-Options: SAMEORIGIN`

---

## 四、M1 (Apple Silicon) 镜像构建

### 4.1 平台指定

**所有 Dockerfile 必须显式指定 `--platform=linux/amd64`**，以便在 x86 服务器（如阿里云）上运行。

```dockerfile
FROM --platform=linux/amd64 eclipse-temurin:21-jdk-alpine AS builder
# ...
FROM --platform=linux/amd64 eclipse-temurin:21-jre-alpine
```

```dockerfile
FROM --platform=linux/amd64 node:20-alpine AS deps
# ...
```

### 4.2 本地构建注意点

| 场景                  | 说明                                                        |
| --------------------- | ----------------------------------------------------------- |
| **Mac M1 构建 amd64** | 走 QEMU 模拟，耗时长且可能不稳定                            |
| **推荐**              | 使用 GitHub Actions 在 amd64 环境构建，推送到 ACR           |
| **本地调试**          | 可临时改为 `linux/arm64` 加速，但部署前需改回 `linux/amd64` |

### 4.3 常见错误

| 现象                | 原因                            | 处理                                        |
| ------------------- | ------------------------------- | ------------------------------------------- |
| `exec format error` | ARM 构建的镜像在 x86 服务器运行 | 确保 Dockerfile 含 `--platform=linux/amd64` |
| 构建超时            | M1 模拟 amd64 慢                | 使用 CI 构建                                |

---

## 五、CI/CD 流程

### 5.1 GitHub Actions

- **工作流**：`.github/workflows/build-push-acr.yml`
- **触发**：push 到 `main`，或 `workflow_dispatch`
- **路径过滤**：仅相关路径变更时构建对应镜像
  - web：`apps/web/**`、`packages/**`
  - admin/nginx：`apps/admin/**`、`infra/nginx/**`
  - java：`services/java/**`、`infra/docker/Dockerfile.java`

### 5.2 镜像仓库

- **阿里云 ACR**：构建后推送，服务器拉取运行
- **本地标签**：`blogs-nginx:latest`、`blogs-web:latest`、`blogs-java:latest`

---

## 六、Dockerfile 清单

| 文件                            | 说明                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `infra/docker/Dockerfile.nginx` | Nginx + Admin 静态，多阶段：先构建 admin 再复制到 nginx   |
| `infra/docker/Dockerfile.web`   | Next.js，多阶段：deps → builder → runner，standalone 输出 |
| `infra/docker/Dockerfile.java`  | Spring Boot，多阶段：Maven 构建 → JRE 运行                |

---

## 七、快速命令

```bash
# 本地构建（M1 较慢）
pnpm docker:build
# 或：docker compose -f infra/docker/docker-compose.yml build

# 启动
pnpm docker:up
# 或：docker compose -f infra/docker/docker-compose.yml up -d

# 停止
pnpm docker:down
```

---

**更新原则**：部署配置变更时，必须同步更新本文档及 `infra/` 下对应文件。
