# AI 协作规范

> 本项目用于学习 Java、Nginx 等技术。AI 协助开发时遵循以下规范。
> 参考 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 与 [精简指南](https://x.com/affaanmustafa/status/2012378465664745795)。

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

---

## Cursor 配置（ECC 完整移植）

| 组件           | 路径                 | 说明                                                              |
| -------------- | -------------------- | ----------------------------------------------------------------- |
| **Rules**      | `.cursor/rules/`     | 39 条规则（common + typescript/python/golang/swift + 项目自定义） |
| **Hooks**      | `.cursor/hooks/`     | 16 个钩子（编辑后格式化、session 持久化、密钥检测等）             |
| **Hooks 配置** | `.cursor/hooks.json` | 钩子事件绑定                                                      |
| **Scripts**    | `scripts/hooks/`     | 钩子实现（format、typecheck、console.log 检测等）                 |

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
