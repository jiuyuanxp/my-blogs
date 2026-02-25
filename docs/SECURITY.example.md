# 安全清单 - 开源博客项目

> 复制为 `SECURITY.md` 后可填入服务器地址、密码等敏感信息。`SECURITY.md` 已加入 `.gitignore`，不会上传到 GitHub。

## 1. 敏感信息

### 1.1 绝不提交

- `.env`、`.env.local`、`.env.production` 等环境变量文件
- 数据库密码、API 密钥、JWT Secret、Session Secret
- SMTP 密码、第三方服务凭证
- SSL 证书私钥（`*.pem`）
- **服务器地址、SSH 密钥、部署凭证** — 仅保存在本地 `SECURITY.md`

### 1.2 配置方式

| 场景 | 做法 |
|------|------|
| 本地开发 | 复制 `.env.example` 为 `.env`，填入本地值，`.env` 已在 `.gitignore` |
| Docker | 使用 `env_file` 或 `environment` 注入，不硬编码 |
| 生产部署 | 使用云平台 Secret/环境变量，或 CI/CD 注入 |

### 1.3 当前项目中的敏感配置

- **PostgreSQL**：`DB_USER`、`DB_PASSWORD` — 生产环境必须修改
- **Redis**：当前无密码，生产建议配置 `requirepass`
- **JWT/Session**：`.env.example` 中为占位符，生产需生成强随机值
- **Spring Boot**：`application.yml` 中数据库密码应通过 `${DB_PASSWORD}` 环境变量注入

## 2. API 安全

### 2.1 当前状态

- `GET /api/articles`、`GET /api/articles/{id}`：公开，无需认证
- `POST/PUT/DELETE /api/articles`：**当前无认证**，任何人可增删改

### 2.2 建议

- 写/删/改接口需增加认证（如 JWT、Session）
- 生产环境限制 CORS 来源，避免 `origins = "*"`
- 对用户输入做校验（如 `@Valid`、长度限制）

## 3. 依赖安全

### 3.1 检查命令

```bash
pnpm audit
pnpm update
```

### 3.2 频率

- 开发阶段：每次添加依赖后
- 上线前：必须通过 `pnpm audit` 无高危漏洞

## 4. 构建产物

### 4.1 不提交

- `node_modules/`
- `target/`（Java/Maven 编译输出）
- `.next/`、`dist/`、`build/`
- `*.tsbuildinfo`

已在根 `.gitignore` 中配置。

## 5. 容器与部署

### 5.1 Docker

- 不在 Dockerfile 中写死密码
- 使用多阶段构建，减小镜像体积
- 生产镜像使用非 root 用户运行（如适用）

### 5.2 Nginx

- 生产启用 HTTPS，配置 SSL
- 限制 `client_max_body_size`，防止大文件攻击
- 可考虑添加 rate limiting

## 6. Actuator / 管理端点

Spring Boot Actuator 当前暴露 `health`、`info`、`metrics`：

- 生产环境建议仅暴露 `health`，或通过内网访问
- 避免暴露 `env`、`configprops` 等敏感端点

## 7. 检查清单（上线前）

- [ ] 所有密码、密钥通过环境变量注入
- [ ] `.env`、`SECURITY.md` 未提交
- [ ] `target/`、`node_modules` 未提交
- [ ] `pnpm audit` 无高危漏洞
- [ ] 写/删/改 API 有认证保护
- [ ] CORS 配置为具体域名，非 `*`
- [ ] 生产数据库使用强密码
- [ ] HTTPS 已配置

---

*复制为 `SECURITY.md` 后可在本地记录服务器地址、密码等，该文件不会上传。*
