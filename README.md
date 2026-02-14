# Blog Monorepo

基于 Monorepo + Nginx 网关架构的个人博客项目，支持微前端和微服务架构，适合学习和练手。

## 架构设计

### 技术栈
- **Monorepo**: Turborepo + pnpm workspace
- **前端**: React/Next.js, Vue/Nuxt, Angular
- **后端**: Node.js, Go, Java
- **网关**: Nginx
- **容器化**: Docker + Docker Compose
- **数据库**: PostgreSQL
- **缓存**: Redis

### 目录结构

```
.
├── apps/                    # 应用层
│   ├── web/                # 主站前端（微前端容器）
│   ├── admin/              # 后台管理
│   └── mobile/             # 移动端
├── services/               # 后端微服务
│   ├── gateway/            # API 网关
│   ├── user/              # 用户服务
│   ├── article/           # 文章服务
│   ├── go/                # Go 服务
│   ├── nodejs/            # Node.js 服务
│   └── java/              # Java 服务
├── packages/              # 共享库
│   ├── ui/                # 通用 UI 组件
│   ├── types/             # TypeScript 类型定义
│   ├── config/            # 配置管理
│   └── utils/             # 工具函数
├── infra/                 # 基础设施
│   ├── nginx/             # Nginx 配置
│   └── docker/            # Docker Compose
├── .github/               # GitHub Actions CI/CD
├── turbo.json             # Turborepo 配置
├── pnpm-workspace.yaml    # pnpm workspace 配置
└── package.json           # 根 package.json
```

### 架构优势

1. **微前端**: 不同前端框架可以独立开发和部署
2. **微服务**: 后端服务按业务领域拆分，独立扩展
3. **代码复用**: 共享 packages 层减少重复代码
4. **统一管理**: 所有项目在同一仓库，便于版本控制和协作
5. **技术栈灵活**: 支持多种编程语言和框架

## 快速开始

### 前置要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

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
pnpm --filter admin dev
```

### 构建项目

```bash
# 构建所有项目
pnpm build

# 构建特定项目
pnpm --filter web build
```

### Docker 部署

```bash
# 启动所有容器
pnpm docker:up

# 停止所有容器
pnpm docker:down
```

## 路由规则

| 路径 | 目标服务 |
|------|----------|
| `/` | Web 前端 (3000) |
| `/api` | Java Blog 服务 (4300) |

## 当前进度

- [x] 初始化 Next.js 前端应用（支持 SEO）
- [x] 初始化 Java Spring Boot 后端服务
- [x] 配置 Nginx 网关路由
- [x] 配置 Docker Compose 部署
- [ ] 创建共享类型定义包
- [ ] 实现前端文章列表页
- [ ] 实现前端文章详情页
- [ ] 添加单元测试和 E2E 测试

## 开发指南

### 前端开发（Next.js + React）

进入 `apps/web` 目录：
```bash
cd apps/web
pnpm dev
```

前端应用已配置 SEO 优化：
- 自动生成 Sitemap
- 自定义 Robots.txt
- Open Graph 和 Twitter 卡片支持
- 结构化数据

### 后端开发（Java + Spring Boot）

进入 `services/java` 目录：
```bash
cd services/java
```

当前实现的 API：
- `GET /api/health` - 健康检查
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/{id}` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/{id}` - 更新文章
- `DELETE /api/articles/{id}` - 删除文章

### Docker 部署

启动所有容器：
```bash
pnpm docker:up
```

访问地址：
- 前端: http://localhost
- API: http://localhost/api

## 学习重点

1. **Monorepo 管理**: 学习 Turborepo 和 pnpm workspace 的使用
2. **微前端架构**: 实现不同框架的页面级集成
3. **微服务架构**: 理解服务拆分和通信模式
4. **容器化部署**: Docker 和 Docker Compose 的实战
5. **网关设计**: Nginx 路由和负载均衡

## License

MIT
