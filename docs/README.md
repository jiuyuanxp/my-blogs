# 文档目录

本仓库文档按类别组织，便于查阅。**本文档为唯一入口**。

## 单源真理 (Single Source of Truth)

以下三个规范文件为所有 Agent 与开发的「宪法」，修改前必须查阅：

| 文档                                       | 说明                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| [tech-stack.md](./tech-stack.md)           | 技术栈：Java 21、Spring Boot 3、Next.js 16、Tailwind CSS 等 |
| [api-contract.md](./api-contract.md)       | 前后端通信：JSON 格式、状态码、错误码                       |
| [deployment-plan.md](./deployment-plan.md) | 部署：Docker 网络、Nginx 转发、M1 镜像构建                  |

## 设计文档一览

| 模块                   | 路径                                                                                                 | 说明                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **API 设计（服务端）** | [api-contract.md](./api-contract.md)、[services/java/docs/api/](../services/java/docs/api/README.md) | 契约见 api-contract；接口清单与详细设计见 java/docs/api；Swagger `/doc.html` |
| **Admin 对接**         | [apps/admin/docs/INTEGRATION.md](../apps/admin/docs/INTEGRATION.md)                                  | 管理后台与 API 对接方式、环境变量、使用接口                                  |
| **Admin 设计**         | [apps/admin/docs/DESIGN.md](../apps/admin/docs/DESIGN.md)                                            | 管理后台设计、规范引用                                                       |
| **Web 对接**           | [apps/web/docs/INTEGRATION.md](../apps/web/docs/INTEGRATION.md)                                      | 前台与 API 对接方式、评论作者 localStorage                                   |
| **Web 设计**           | [apps/web/docs/DESIGN.md](../apps/web/docs/DESIGN.md)                                                | 前台设计、移动端适配                                                         |
| **Java 服务**          | [services/java/docs/DESIGN.md](../services/java/docs/DESIGN.md)                                      | 后端架构、DTO、软删除、缓存                                                  |
| **数据表设计**         | [services/java/docs/SCHEMA_TABLES.md](../services/java/docs/SCHEMA_TABLES.md)                        | 表结构、认证说明、admin 密码配置、admin_user 扩展设计                        |
| **Redis 部署**         | [deploy/REDIS_DEPLOY.md](./deploy/REDIS_DEPLOY.md)                                                   | Redis 部署方式、Docker、与 Java 集成                                         |
| **RBAC 权限系统**      | [design/RBAC_DESIGN.md](./design/RBAC_DESIGN.md)                                                     | 用户/角色/权限设计、API、Admin 对接、待讨论项                                |
| **规范合规**           | [development/CURSORRULES_COMPLIANCE.md](./development/CURSORRULES_COMPLIANCE.md)                     | .cursorrules 合规性检测报告（Java/Next.js/Admin/Docker/Nginx）               |

## 目录结构

```
docs/
├── README.md           # 本文件，文档唯一入口
├── tech-stack.md       # 技术栈规范 (SSOT)
├── api-contract.md     # API 契约规范 (SSOT)
├── deployment-plan.md  # 部署规划 (SSOT)
├── active-task.md      # 当前任务追踪（复杂任务时维护）
├── deploy/             # 部署相关
│   ├── DEPLOY.md       # 服务器部署（阿里云 2C2G 纯 Docker）
│   ├── DEPLOY_JAVA.md  # Java 服务部署（PostgreSQL + Redis）
│   ├── DEPLOY_ACR_COMMANDS.md  # ACR 拉取命令（本地使用，已 .gitignore）
│   └── REDIS_DEPLOY.md # Redis 部署与 Java 集成
├── design/             # 设计文档
│   └── RBAC_DESIGN.md  # RBAC 权限系统设计
├── security/           # 安全相关
│   └── SECURITY.example.md  # 安全清单模板（复制为 SECURITY.md 后填入敏感信息）
└── development/       # 开发指南
    ├── CLAUDE_CODE_COMMANDS.md  # Everything Claude Code 中文指令手册
    └── CURSORRULES_COMPLIANCE.md  # .cursorrules 合规性检测报告
```

## 快速链接

| 类别     | 文档                                                                                                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SSOT** | [tech-stack](./tech-stack.md)、[api-contract](./api-contract.md)、[deployment-plan](./deployment-plan.md)                                                                                                              |
| **部署** | [deploy/DEPLOY.md](./deploy/DEPLOY.md)、[deploy/DEPLOY_JAVA.md](./deploy/DEPLOY_JAVA.md)、[deploy/REDIS_DEPLOY.md](./deploy/REDIS_DEPLOY.md)、[deploy/DEPLOY_ACR_COMMANDS.md](./deploy/DEPLOY_ACR_COMMANDS.md)（本地） |
| **安全** | [security/SECURITY.example.md](./security/SECURITY.example.md)                                                                                                                                                         |
| **开发** | [development/CLAUDE_CODE_COMMANDS.md](./development/CLAUDE_CODE_COMMANDS.md)、[development/CURSORRULES_COMPLIANCE.md](./development/CURSORRULES_COMPLIANCE.md)                                                         |
