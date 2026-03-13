# Agentic Blog Monorepo

这是一个面向 **Agentic Engineering**（AI 智能体工程）实践的实验性个人博客项目。项目主旨在于探索如何利用 AI 协作产出**正确且规范**的高质量代码，并以此为基础，通过“先实现、后复盘”的方式深度学习后端（Java、Nginx 等）及全栈技术。

## 核心理念

- **规范先行**：通过 `.cursorrules` 和 `AGENTS.md` 定义严格的工程规范，确保 AI 产出的每一行代码都符合工业级标准。
- **以码为学**：不只是让 AI 写代码，而是将 AI 生成的高质量代码作为“活教材”，通过阅读、提问和复盘，掌握后端架构、设计模式及中间件技术。
- **自动化协作**：利用 Cursor Hooks 和自定义脚本实现开发流程的自动化（格式化、类型检查、安全审计）。

## Agentic Engineering 实践

本项目将 AI 从「聊天助手」升级为「全自动化工程伙伴」，参考 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 体系，实现以下能力：

### 1. 规范驱动（Spec-First）

| 组件         | 路径                     | 作用                                                        |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| **编码规范** | `.cursorrules`           | 按文件类型触发（Java/Next.js/Docker/Nginx），约束「怎么写」 |
| **协作规范** | [AGENTS.md](./AGENTS.md) | 协作流程、快捷指令、子代理映射，约束「怎么协作」            |
| **规则库**   | `.cursor/rules/`         | 11 条规则：核心原则、安全、测试、TS/Java 风格、任务编排等   |

### 2. 快捷指令（Slash Commands）

在 Cursor 对话中直接输入以下指令，触发标准化工作流：

| 指令        | 动作           | 场景                 |
| ----------- | -------------- | -------------------- |
| `/review`   | 深度代码审查   | 提交 PR 前、重构后   |
| `/test`     | 生成并运行测试 | 功能开发完成后       |
| `/fix`      | 诊断并修复报错 | 编译/测试失败时      |
| `/refactor` | 优化结构可读性 | 消除代码味道         |
| `/doc`      | 更新文档       | 接口变更、新功能发布 |
| `/shield`   | 安全审计       | 敏感数据、鉴权逻辑   |

### 3. 任务指令（Task Commands）

AI 可自动调用的项目命令：`!lint`、`!format`、`!build`、`!test`、`!typecheck`。

### 4. 自动化钩子（Hooks）

| 类型         | 路径             | 说明                                                            |
| ------------ | ---------------- | --------------------------------------------------------------- |
| **事件钩子** | `.cursor/hooks/` | 16 个钩子：编辑后、Shell 执行前后、MCP 调用、Session 生命周期等 |
| **实现脚本** | `scripts/hooks/` | 编辑后格式化、类型检查、console.log 检测、Session 评估等        |

### 5. 子代理（Subagents）

复杂任务可委托 `mcp_task` 子代理：功能规划、架构设计、代码审查、安全审计、构建错误修复、E2E 测试、TDD 开发、文档更新、代码库探索等。

### 6. 扩展能力

| 类型       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| **Skills** | sync-docs（文档同步检测）、spring-boot-openapi-documentation |
| **MCP**    | OpenAPI 加载 `specs/` 规范，供 AI 做 API 感知的代码生成      |

### 7. CI 校验

`scripts/validate-agents-md.js` 在 CI 中校验 AGENTS.md 命令存在性、文档路径有效性。

### 8. 其他实践

- **API 文档与类型同步**：`scripts/generate-api-docs.js` 从 OpenAPI 生成 types 与接口清单，编辑 DTO/Controller 时 Hook 自动触发，保持 DTO↔TS 一致
- **包级 AGENTS.md**：web、admin、java 各有各自的 AGENTS.md，提供分层上下文
- **任务追踪**：`docs/active-task.md` 模板，复杂任务多步骤时维护目标、进度、待验证
- **提交前校验**：Prettier + Husky + Commitlint + ESLint，lint-staged 自动格式化与 lint

---

详细指令手册见 [docs/development/CLAUDE_CODE_COMMANDS.md](./docs/development/CLAUDE_CODE_COMMANDS.md)。

## 文档导航

| 文档                               | 说明                            |
| ---------------------------------- | ------------------------------- |
| [docs/README.md](./docs/README.md) | 文档目录（含 SSOT、设计、部署） |
| [AGENTS.md](./AGENTS.md)           | AI 协作规范、快捷指令           |

### ECC (Everything Claude Code) 移植组件

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
