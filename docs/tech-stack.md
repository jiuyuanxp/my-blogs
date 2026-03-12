# 技术栈规范 (Single Source of Truth)

> 本文档为项目技术选型的唯一权威来源，所有 Agent 与开发者必须据此实现。

## 一、整体架构

| 层级           | 技术                       | 版本                        | 说明                             |
| -------------- | -------------------------- | --------------------------- | -------------------------------- |
| **Monorepo**   | Turborepo + pnpm workspace | Turborepo 2.x, pnpm 10.29.3 | 统一构建与依赖管理               |
| **包管理**     | pnpm                       | ≥8.0.0                      | 根 `packageManager` 锁定 10.29.3 |
| **Node**       | Node.js                    | ≥18.0.0                     | 推荐 20 LTS                      |
| **TypeScript** | TypeScript                 | ^5.3                        | 全栈类型安全                     |

## 二、前端

### 2.1 Web 主站 (apps/web)

| 技术               | 版本     | 说明                                             |
| ------------------ | -------- | ------------------------------------------------ |
| **Next.js**        | 16.1.6   | App Router，Server Components 优先               |
| **React**          | 19.2.3   | 含 React DOM                                     |
| **Tailwind CSS**   | ^4       | 使用 @tailwindcss/postcss、@tailwindcss/vite     |
| **next-intl**      | ^4.8.2   | 国际化                                           |
| **react-markdown** | ^10.1.0  | Markdown 渲染，配合 remark-gfm、rehype-highlight |
| **highlight.js**   | ^11.11.1 | 代码高亮                                         |
| **date-fns**       | ^4.1.0   | 日期格式化                                       |
| **motion**         | ^12.34.3 | 动画                                             |
| **lucide-react**   | ^0.575.0 | 图标                                             |

### 2.2 Admin 管理后台 (apps/admin)

| 技术                      | 版本    | 说明            |
| ------------------------- | ------- | --------------- |
| **Vite**                  | ^6.2.0  | 构建工具        |
| **React**                 | ^19.0.0 | 同 Web          |
| **Tailwind CSS**          | ^4.1.14 | 与 Web 保持一致 |
| **recharts**              | ^3.7.0  | 图表            |
| **react-markdown**        | ^10.1.0 | 富文本预览      |
| **clsx + tailwind-merge** | -       | 样式合并        |

### 2.3 共享包 (packages/)

| 包                   | 说明                                  |
| -------------------- | ------------------------------------- |
| **@blog/api-client** | 统一 API 客户端，web/admin 共用       |
| **@blog/types**      | TypeScript 类型定义，与 Java DTO 同步 |
| **@blog/utils**      | 工具函数                              |

## 三、后端

### 3.1 Java 服务 (services/java)

| 技术                       | 版本  | 说明                                                  |
| -------------------------- | ----- | ----------------------------------------------------- |
| **Java**                   | 21    | LTS，`maven.compiler.source/target` 均为 21           |
| **Spring Boot**            | 3.2.0 | parent POM                                            |
| **Spring Data JPA**        | -     | 随 Spring Boot                                        |
| **PostgreSQL Driver**      | -     | runtime scope                                         |
| **H2**                     | -     | 本地开发无 PostgreSQL 时使用                          |
| **Spring Data Redis**      | -     | Token 存储、缓存                                      |
| **Spring Validation**      | -     | Bean Validation                                       |
| **spring-security-crypto** | -     | BCrypt 密码加密（不含 Security 全栈）                 |
| **Spring Actuator**        | -     | 健康检查                                              |
| **Knife4j OpenAPI 3**      | 4.5.0 | Swagger UI：`/doc.html`，OpenAPI JSON：`/v3/api-docs` |
| **Lombok**                 | -     | 减少样板代码                                          |

### 3.2 数据库与缓存

| 技术           | 版本     | 说明        |
| -------------- | -------- | ----------- |
| **PostgreSQL** | 16       | 主数据库    |
| **Redis**      | 7-alpine | Token、缓存 |

## 四、基础设施

| 技术               | 版本   | 说明                              |
| ------------------ | ------ | --------------------------------- |
| **Nginx**          | alpine | 反向代理、静态资源                |
| **Docker**         | -      | 多阶段构建，见 deployment-plan.md |
| **GitHub Actions** | -      | CI 构建并推送到阿里云 ACR         |

## 五、开发规范引用

| 领域       | 规范/技能                                          |
| ---------- | -------------------------------------------------- |
| REST API   | api-design、springboot-patterns                    |
| 前端 UI    | web-design-guidelines、vercel-react-best-practices |
| Java 代码  | java-coding-standards、11-java-patterns.mdc        |
| TypeScript | 10-typescript-patterns.mdc                         |
| 安全       | 01-security.mdc                                    |

---

**更新原则**：技术栈变更时，必须同步更新本文档，并通知相关 Agent/开发者。
