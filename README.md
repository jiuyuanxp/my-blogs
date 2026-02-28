# Blog Monorepo

基于 Monorepo + Nginx 网关架构的个人博客项目，支持微前端和微服务架构，适合学习和练手前后端、部署、SEO 等知识。

## 文档导航

| 文档                                                           | 说明                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| [AGENTS.md](./AGENTS.md)                                       | AI 协作规范、五大原则、代码规范                          |
| [.cursor/rules/](./.cursor/rules/)                             | Cursor 规则（安全、测试、TS/Java 风格）                  |
| [docs/AI_DEVELOPMENT.md](./docs/AI_DEVELOPMENT.md)             | 如何使用 AI 编程构建本项目                               |
| [docs/SECURITY.example.md](./docs/SECURITY.example.md)         | 安全清单模板（敏感信息放本地 `SECURITY.md`，不上传）     |
| [docs/CLAUDE_CODE_COMMANDS.md](./docs/CLAUDE_CODE_COMMANDS.md) | Everything Claude Code 中文指令手册（/review、/test 等） |

### ECC 移植组件

| 路径                            | 说明         |
| ------------------------------- | ------------ |
| `.cursor/rules/`                | 39 条规则    |
| `.cursor/hooks/` + `hooks.json` | 自动化钩子   |
| `scripts/hooks/`                | 钩子实现脚本 |

## 架构设计

### 技术栈

- **Monorepo**: Turborepo + pnpm workspace
- **前端**: Next.js (React), TypeScript
- **后端**: Java (Spring Boot), Node.js, Go（待开发）
- **网关**: Nginx
- **容器化**: Docker + Docker Compose
- **数据库**: PostgreSQL
- **缓存**: Redis

### 目录结构

```
.
├── apps/                    # 应用层
│   └── web/                # 主站前端（Next.js）
├── services/               # 后端微服务
│   └── java/               # 博客服务（Spring Boot，含文章 CRUD）
├── packages/               # 共享库
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── docs/                   # 设计文档
├── infra/                  # 基础设施
│   ├── nginx/              # Nginx 配置
│   └── docker/             # Docker Compose 与 Dockerfile
├── turbo.json              # Turborepo 配置
├── pnpm-workspace.yaml     # pnpm workspace 配置
└── package.json            # 根 package.json
```

### 架构优势

1. **微前端**：不同前端框架可独立开发和部署
2. **微服务**：后端按业务领域拆分，独立扩展
3. **代码复用**：共享 packages 层减少重复
4. **统一管理**：同一仓库，便于版本控制和协作
5. **技术栈灵活**：支持多种编程语言和框架

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose（可选）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有服务（开发模式）
pnpm dev

# 启动特定服务
pnpm --filter web dev
```

### 构建项目

```bash
pnpm build
pnpm --filter web build
```

### Docker 部署

```bash
pnpm docker:up
pnpm docker:down
```

Docker Compose 包含：Nginx 网关、Web 前端、blog-service（Java）、PostgreSQL、Redis。

## 路由规则

| 路径   | 目标服务                         | 端口 |
| ------ | -------------------------------- | ---- |
| `/`    | Web 前端                         | 3000 |
| `/api` | blog-service（Java Spring Boot） | 4300 |

## 当前进度

- [x] 初始化 Next.js 前端应用（支持 SEO）
- [x] 初始化 Java Spring Boot 后端服务（文章 CRUD、PostgreSQL、Redis）
- [x] 配置 Nginx 网关路由
- [x] 配置 Docker Compose 部署
- [x] 创建共享包（types、utils）
- [x] 国际化（next-intl）
- [ ] 实现前端文章列表页（对接真实 API）
- [ ] 实现前端文章详情页
- [ ] 添加单元测试和 E2E 测试

## 开发指南

### 前端（Next.js）

```bash
cd apps/web
pnpm dev
```

已配置 SEO：Sitemap、Robots.txt、Open Graph、Twitter 卡片、结构化数据。

### 后端（Java + Spring Boot）

```bash
cd services/java
./mvnw spring-boot:run
```

当前 API：

- `GET /api/health` - 健康检查
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/{id}` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/{id}` - 更新文章
- `DELETE /api/articles/{id}` - 删除文章

### 环境配置

复制 `.env.example` 为 `.env` 并填入本地配置。**切勿提交 `.env` 到版本控制。** 安全清单模板见 [docs/SECURITY.example.md](./docs/SECURITY.example.md)，本地敏感信息放 `docs/SECURITY.md`（已 gitignore）。

## 学习重点

1. **Monorepo 管理**：Turborepo、pnpm workspace
2. **微前端架构**：页面级集成
3. **微服务架构**：服务拆分与通信
4. **容器化部署**：Docker、Docker Compose
5. **网关设计**：Nginx 路由与负载均衡
6. **SEO 优化**：Metadata、Sitemap、JSON-LD

## License

MIT
