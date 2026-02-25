# Blog Monorepo - AI 协作规范

> 个人博客学习项目，用于练手前后端、部署、SEO 等知识。本文档指导 AI 如何协助开发。

## 核心工作流

**文档优先，避免重复：**

1. **写代码前先写文档**：新功能/模块需在 `docs/` 或相关 README 中先描述设计、接口、流程
2. **文档不重复**：同一信息只在一个地方维护，其他处用链接引用
3. **可学习性**：文档面向「作者本人学习」，保持清晰、可追溯

## 文档分工

| 文档 | 职责 | 避免重复 |
|------|------|----------|
| `README.md` | 项目概览、快速开始、架构说明 | 不写技术细节、不写 AI 规范 |
| `AGENTS.md` | AI 协作规范、代码规范、开发流程 | 不写项目介绍 |
| `docs/AI_DEVELOPMENT.md` | 如何使用 AI 编程构建本项目 | 不写通用规范 |
| `docs/SECURITY.example.md` | 安全清单模板（公开） | 不写部署步骤 |
| `docs/SECURITY.md` | 本地敏感信息（服务器地址、密码等） | **不提交**，已加入 `.gitignore` |
| `docs/*.md` | 各模块设计文档（按需创建） | 每个主题只写一个文件 |

## 代码规范

### TypeScript/JavaScript

- 使用 TypeScript strict 模式
- 组件使用函数式组件 + Hooks
- 避免使用 `any` 类型
- 使用 ES6+ 语法特性

### React/Next.js

- 使用 Next.js App Router（不是 Pages Router）
- 服务端组件优先，客户端组件按需使用
- 使用 Server Actions 处理表单
- 遵循 React Hooks 规则

### Java/Spring Boot

- 使用 Spring Boot 3.x
- RESTful API 设计
- 使用 Lombok 减少样板代码
- 遵循分层架构：Controller → Service → Repository

### Git 提交规范

遵循 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

## 安全规范（开源项目）

- **敏感信息**：密码、密钥、Token 一律通过环境变量注入，不硬编码
- **配置模板**：`.env.example` 仅提供占位符，生产值需在部署时单独配置
- **API 安全**：写接口前在 `docs/SECURITY.md` 确认认证/授权设计
- **依赖更新**：定期 `pnpm audit` 和 `pnpm update` 检查安全漏洞

详见 `docs/SECURITY.md`。

## 技术栈

### 前端

- **框架**: Next.js (React)
- **语言**: TypeScript
- **构建工具**: Turborepo
- **包管理**: pnpm workspace

### 后端

- **Java**: Spring Boot (主要后端服务)
- **Node.js**: Express/服务
- **Go**: 服务
- **数据库**: PostgreSQL
- **缓存**: Redis

### 基础设施

- **容器化**: Docker + Docker Compose
- **网关**: Nginx
- **CI/CD**: GitHub Actions

## 项目结构

```
.
├── apps/                    # 前端应用
│   ├── web/                # 主站前端（Next.js）
│   ├── admin/              # 后台管理（待开发）
│   └── mobile/             # 移动端（待开发）
├── services/               # 后端微服务
│   ├── gateway/            # API 网关
│   ├── user/               # 用户服务（待开发）
│   ├── article/            # 文章服务（待开发）
│   ├── nodejs/             # Node.js 服务（待开发）
│   ├── go/                 # Go 服务（待开发）
│   └── java/               # Java Spring Boot 服务
├── packages/               # 共享库
│   ├── ui/                 # 通用 UI 组件（待开发）
│   ├── types/              # TypeScript 类型定义
│   ├── config/             # 配置管理（待开发）
│   └── utils/               # 工具函数
├── docs/                   # 设计文档
├── infra/                  # 基础设施
│   ├── nginx/              # Nginx 配置
│   └── docker/             # Docker Compose 配置
├── .github/                # GitHub Actions CI/CD
├── turbo.json              # Turborepo 配置
├── pnpm-workspace.yaml     # pnpm workspace 配置
└── package.json            # 根 package.json
```

## 开发流程

### 前端开发

```bash
pnpm install
pnpm dev
pnpm --filter web dev
pnpm build
```

### 后端开发

```bash
cd services/java
./mvnw spring-boot:run
# 或
pnpm docker:up
```

### SEO 优化

前端已配置 SEO：

- 自动生成 Sitemap
- 自定义 Robots.txt
- Open Graph 和 Twitter 卡片
- 结构化数据（JSON-LD）

## API 路由规则

| 路径          | 目标服务       | 端口 |
| ------------- | -------------- | ---- |
| `/`           | Web 前端       | 3000 |
| `/api`        | Java Blog 服务 | 4300 |
| `/api/health` | 健康检查       | 4300 |

## Monorepo 管理

- 共享类型：`packages/types/`
- 工具函数：`packages/utils/`
- 共享 UI：`packages/ui/`
- 使用 pnpm workspace 引用本地包，避免循环依赖

## 当前进度

- [x] 初始化 Next.js 前端应用（支持 SEO）
- [x] 初始化 Java Spring Boot 后端服务
- [x] 配置 Nginx 网关路由
- [x] 配置 Docker Compose 部署
- [x] 创建共享类型定义包
- [x] 国际化（next-intl）
- [ ] 实现前端文章列表页（对接真实 API）
- [ ] 实现前端文章详情页
- [ ] 添加单元测试和 E2E 测试

## 技能使用

本项目可加载以下 Skills：

- `nextjs-seo` - Next.js SEO 优化
- `web-design-guidelines` - Web 界面设计规范
- `monorepo-management` - Monorepo 管理
- `java-spring-boot` - Spring Boot 开发
- `docker-deployment` - Docker 部署
- `git-hooks-setup` - Git Hooks
- `vercel-react-best-practices` - React 性能优化

## 语言要求

- **响应语言**：中文（简体）
- **代码、API、路径**：保持英文
