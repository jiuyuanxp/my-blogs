# Redis 部署说明

本文档说明如何在博客系统中部署 Redis，用于 Token 存储与可选缓存。

## 一、Redis 的作用

| 用途         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| 认证 Token   | 简单 Token 方案下，登录后的 token 存 Redis，TTL 过期自动失效 |
| 缓存（可选） | 分类树、文章详情等可缓存，减轻数据库压力                     |

## 二、部署方式

### 方式一：Docker 单机（推荐）

**适用**：本地开发、单机部署（如阿里云 2C2G 轻量服务器）

```bash
# 创建网络（若已有可跳过）
docker network create blog-net

# 运行 Redis
docker run -d \
  --name redis \
  --network blog-net \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine redis-server --appendonly yes
```

- `-v redis-data:/data`：数据持久化
- `--appendonly yes`：AOF 持久化

**验证**：

```bash
docker exec -it redis redis-cli ping
# 应返回 PONG
```

---

### 方式二：Docker Compose 集成

在 `docker-compose.yml` 中增加：

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    networks:
      - blog-net
    restart: unless-stopped

volumes:
  redis-data:

networks:
  blog-net:
    driver: bridge
```

---

### 方式三：云托管 Redis

**适用**：阿里云、腾讯云等云厂商 Redis 实例

- 阿里云：云数据库 Redis 版
- 创建实例后获取连接地址（如 `r-xxx.redis.rds.aliyuncs.com:6379`）
- 配置白名单（服务器 IP）
- 若需密码，在连接字符串或环境变量中配置

## 三、Java 服务配置

在 `application.yml` 中配置 Redis（项目已包含 `spring-boot-starter-data-redis`）：

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:} # 无密码时留空
      database: 0
```

**环境变量**：

| 变量           | 默认      | 说明                      |
| -------------- | --------- | ------------------------- |
| REDIS_HOST     | localhost | Redis 地址                |
| REDIS_PORT     | 6379      | 端口                      |
| REDIS_PASSWORD | 空        | 密码（云 Redis 通常需要） |

## 四、与现有部署架构集成

若当前部署为 Nginx + web + admin（见 [DEPLOY.md](./DEPLOY.md)），增加 Redis 与 Java 服务后：

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
    │    ┌─────┼─────┬─────────────┐                        │
    │    │     │     │             │                         │
    │    ▼     ▼     ▼             ▼                         │
    │  /admin /web  /api/*     (静态)                        │
    │    │     │     │                                       │
    │    │     │     └── 反向代理 → Java :4300                │
    │    │     │                    │                         │
    │    │     │                    ├── PostgreSQL            │
    │    │     │                    └── Redis                 │
    │    │     └── Next.js :3000                             │
    │    └── 静态文件                                          │
    └─────────────────────────────────────────────────────┘
```

**Nginx 配置示例**（/api 反向代理到 Java）：

```nginx
location /api/ {
    proxy_pass http://java:4300;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 五、无 Redis 时的降级

若暂不部署 Redis：

- **Token 存储**：使用内存 `ConcurrentHashMap`，服务重启后 token 失效，需重新登录
- **缓存**：不启用 `@Cacheable`，直接查数据库

可通过配置开关控制：

```yaml
app:
  auth:
    token-store: redis # redis | memory
  cache:
    enabled: false # 是否启用缓存
```
