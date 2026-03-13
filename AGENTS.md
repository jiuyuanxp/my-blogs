# AI 协作规范

> 本项目用于学习 Java、Nginx 等技术。AI 协助开发时遵循以下规范。
> 参考 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 与 [精简指南](https://x.com/affaanmustafa/status/2012378465664745795)。
>
> **最后更新**：2025-03-13

## 职责划分

| 文档             | 职责                                                         |
| ---------------- | ------------------------------------------------------------ |
| **.cursorrules** | 按文件类型触发的编码规范（Java/Next.js/Docker/Nginx 怎么写） |
| **AGENTS.md**    | 协作流程、快捷指令、子代理、Cursor 配置（怎么协作）          |
| **docs/**        | 技术栈、API 契约、部署规划等 SSOT                            |

## 核心原则

1. **先看规范再写代码** - 查阅 `.cursorrules` 对应栈、api-design、安全规则等
2. **代码即文档** - 命名自解释，避免冗余注释
3. **注释写 Why** - 只注释业务原因、技术权衡、复杂逻辑
4. **文档可执行** - 优先维护可运行的示例代码和架构图

## AI 协作五大原则（Everything Claude Code）

| 原则               | 说明                                 |
| ------------------ | ------------------------------------ |
| **保持简单**       | 不过度复杂化指令，一次聚焦一个任务   |
| **上下文珍贵**     | 减少 Token 消耗，只引用相关文件      |
| **并行执行**       | 独立任务用 `mcp_task` 并行启动子代理 |
| **自动化重复**     | 编辑后格式化、类型检查、提交前 lint  |
| **限制子代理范围** | 给子代理明确且狭窄的任务边界         |

## Git 提交

提交信息**使用中文**描述：

```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
refactor: 重构
chore: 构建/配置
```

## 学习导向

AI 生成代码时：

1. **关键处加学习注释** - 如 `// 依赖注入：Spring 自动管理 Bean 生命周期`
2. **生成后可提问** - 「这段代码如何体现 Spring 的 AOP？」
3. **笔记优先** - 复杂概念在 `docs/learning/` 创建学习笔记
4. **ADR 建议** - 对于复杂的架构设计或技术选型（如 Nginx 缓存策略、Spring Security 过滤链、新中间件引入），应在 `docs/learning/` 下生成简短 ADR，说明 Why 与取舍

## 技术栈

详见 [docs/tech-stack.md](./docs/tech-stack.md)。

## 快速命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动所有服务
pnpm --filter web dev # 只启动前端
pnpm build            # 构建全部
pnpm docs:generate    # 从 OpenAPI 自动生成 types + 接口清单（需 Java 服务已启动）
```

## 快捷指令（提示词模板）

在对话中输入以下指令触发对应工作流，详见 [docs/development/CLAUDE_CODE_COMMANDS.md](./docs/development/CLAUDE_CODE_COMMANDS.md)：

| 指令        | 动作           | 场景                 |
| ----------- | -------------- | -------------------- |
| `/review`   | 深度代码审查   | 提交 PR 前、重构后   |
| `/test`     | 生成并运行测试 | 功能开发完成后       |
| `/fix`      | 诊断并修复报错 | 编译/测试失败时      |
| `/refactor` | 优化结构可读性 | 消除代码味道         |
| `/doc`      | 更新文档       | 接口变更、新功能发布 |
| `/shield`   | 安全审计       | 敏感数据、鉴权逻辑   |

## 任务指令

AI 可自动调用的项目命令：

| 指令         | 命令             | 说明            |
| ------------ | ---------------- | --------------- |
| `!lint`      | `pnpm lint`      | 格式与规范检查  |
| `!format`    | `pnpm format`    | Prettier 格式化 |
| `!build`     | `pnpm build`     | 项目构建        |
| `!test`      | `pnpm test`      | 运行测试        |
| `!typecheck` | `pnpm typecheck` | 静态类型检查    |

---

## 常见任务分步说明（Common Patterns）

以下为高频任务的步骤化指引，Agent 应严格按序执行。

### 新增 API 接口

1. 在 `docs/active-task.md` 或 `services/java/docs/api/` 对应设计文档中列出接口契约（路径、方法、请求/响应 DTO）
2. 在 `services/java` 中实现：Controller → Service → Repository（按需）
3. 添加 Swagger 注解（`@Operation`、`@ApiResponse`），DTO 与 Entity 分离
4. 同步更新 `docs/api-contract.md`、`services/java/docs/api/` 接口清单、`packages/types`
5. 运行 `pnpm docs:generate`（需 Java 服务已启动）更新 OpenAPI 与 types
6. 运行 `pnpm typecheck` 验证类型
7. 运行 `mvn test -f services/java/pom.xml` 验证后端

### 新增前端页面/组件（Web）

1. 查阅 `apps/web/docs/INTEGRATION.md` 确认 API 对接方式
2. 使用 `@blog/api-client` 发起请求，`isApiError(err)` 解析错误
3. 默认 Server Component，仅需交互时使用 `"use client"`
4. 严格 Tailwind CSS，图片用 `next/image`
5. 运行 `pnpm typecheck` 验证

### 新增管理后台功能（Admin）

1. 查阅 `apps/admin/docs/INTEGRATION.md` 确认 API 与认证方式
2. 使用 `@blog/api-client`，Token 存 localStorage，401 时清除并跳转登录
3. 图标按钮加 `aria-label`，表单加 `label` 或 `aria-label`
4. 运行 `pnpm typecheck` 验证

### 接口/DTO 变更后的文档同步（强制）

| 变更类型      | 须更新文档                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| Java DTO/接口 | `docs/api-contract.md`、`services/java/docs/api/` 对应设计、`packages/types` |
| 完成后验证    | 运行 `pnpm typecheck`                                                        |

### 复杂任务追踪

多步骤、跨多文件任务时，维护 `docs/active-task.md`：填写任务目标、进度、已决策、待验证、下一步。参考 `.cursor/rules/12-task-orchestration.mdc`。

---

## Agents（ECC 子代理映射）

复杂任务可委托给 `mcp_task` 子代理，对应 ECC 的 agents 职责：

| 场景         | 子代理类型     | 对应 ECC Agent       |
| ------------ | -------------- | -------------------- |
| 功能实现规划 | generalPurpose | planner              |
| 系统架构设计 | generalPurpose | architect            |
| 代码审查     | generalPurpose | code-reviewer        |
| 安全审计     | generalPurpose | security-reviewer    |
| 构建错误修复 | generalPurpose | build-error-resolver |
| E2E 测试生成 | generalPurpose | e2e-runner           |
| TDD 开发     | generalPurpose | tdd-guide            |
| 死代码清理   | generalPurpose | refactor-cleaner     |
| 文档更新     | generalPurpose | doc-updater          |
| 代码库探索   | explore        | —                    |

### build-error-resolver 触发条件

**委托子代理**（使用 `mcp_task`，子代理类型 `generalPurpose`，任务描述含「构建错误修复」）当：

- 根因涉及**多文件**、**跨栈**（前后端联动、API 契约漂移）
- 需**系统性排查**（依赖链、配置、环境）
- 单次修复后仍失败，需多轮试错

**直接修复**（不委托）当：

- 单点错误：单文件类型错误、单处 import 路径、单条断言失败
- 根因明确且修复范围小

详见 `/fix` 流程与 `.cursor/rules/13-automation.mdc`。

---

## Cursor 配置（ECC 完整移植）

| 组件           | 路径                 | 说明                                                              |
| -------------- | -------------------- | ----------------------------------------------------------------- |
| **Rules**      | `.cursor/rules/`     | 39 条规则（common + typescript/python/golang/swift + 项目自定义） |
| **Hooks**      | `.cursor/hooks/`     | 16 个钩子（编辑后格式化、session 持久化、密钥检测等）             |
| **Hooks 配置** | `.cursor/hooks.json` | 钩子事件绑定                                                      |
| **Scripts**    | `scripts/hooks/`     | 钩子实现（format、typecheck、console.log 检测等）                 |

---

## 维护与校验

### 维护周期

- **AGENTS.md**：规范或命令变更时立即更新；建议每季度复核一次
- **last updated**：每次实质性修改后更新顶部日期

### 自动化校验（CI）

`scripts/validate-agents-md.js` 在 CI 中执行，校验：

- AGENTS.md 中列出的快速命令在 `package.json` 中存在
- `docs/` 下 SSOT 文档路径存在
- 根目录与包级 AGENTS.md 引用路径有效

PR 修改 AGENTS.md 或 docs/ 时，CI 会运行该校验。

### 已知限制

- `pnpm docs:generate` 需 Java 服务已启动，首次使用 `specs/` 前需先执行
- MCP OpenAPI 依赖 `specs/openapi.json`，空目录时 MCP 无法加载

---

**项目概览见** [`README.md`](./README.md)  
**学习笔记见** `docs/learning/`

---

## 已安装 Skills

| Skill                             | 用途                                               |
| --------------------------------- | -------------------------------------------------- |
| sync-docs                         | 文档与代码同步检测（import 路径、版本、CHANGELOG） |
| spring-boot-openapi-documentation | Spring Boot + SpringDoc 配置与注解最佳实践         |

## 已配置 MCP

| MCP                          | 用途                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| openapi (@reapi/mcp-openapi) | 加载 `specs/` 下 OpenAPI 规范，供 AI 做 API 感知的代码生成 |
