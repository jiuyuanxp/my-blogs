# Blog Monorepo

基于 Monorepo 的个人博客项目，支持微前端和微服务架构，适合学习和练手前后端、SEO 等知识。

## 文档导航

| 文档                               | 说明                            |
| ---------------------------------- | ------------------------------- |
| [docs/README.md](./docs/README.md) | 文档目录（含 SSOT、设计、部署） |
| [AGENTS.md](./AGENTS.md)           | AI 协作规范、快捷指令           |

### ECC 移植组件

| 路径                            | 说明         |
| ------------------------------- | ------------ |
| `.cursor/rules/`                | 39 条规则    |
| `.cursor/hooks/` + `hooks.json` | 自动化钩子   |
| `scripts/hooks/`                | 钩子实现脚本 |

## 架构设计

技术栈详见 [docs/tech-stack.md](./docs/tech-stack.md)。

### 目录结构

```
.
├── apps/                    # 应用层
│   ├── web/                # 主站前端（Next.js）
│   └── admin/              # 管理后台（Vite + React）
├── services/               # 后端微服务
│   └── java/               # 博客服务（Spring Boot，含文章 CRUD）
├── packages/               # 共享库
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   └── api-client/         # 统一 API 客户端（web/admin 共用）
├── docs/                   # 设计文档
├── turbo.json              # Turborepo 配置
├── pnpm-workspace.yaml     # pnpm workspace 配置
└── package.json            # 根 package.json
```

### 部署

- **镜像构建**：GitHub Actions 在 push 到 `main` 时自动构建并推送到阿里云 ACR
- **服务器**：拉取镜像后 `docker compose up -d` 启动，详见 [docs/deploy/DEPLOY.md](./docs/deploy/DEPLOY.md)

### 架构优势

1. **微前端**：不同前端框架可独立开发和部署
2. **微服务**：后端按业务领域拆分，独立扩展
3. **代码复用**：共享 packages 层减少重复
4. **统一管理**：同一仓库，便于版本控制和协作
5. **技术栈灵活**：支持多种编程语言和框架
