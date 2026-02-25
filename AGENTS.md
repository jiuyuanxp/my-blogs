# AI 协作规范

> 本项目用于学习 Java、Nginx 等技术。AI 协助开发时遵循以下规范。

## 核心原则

1. **代码即文档** - 命名自解释，避免冗余注释
2. **注释写 Why** - 只注释业务原因、技术权衡、复杂逻辑
3. **文档可执行** - 优先维护可运行的示例代码和架构图

## 代码规范

### 通用

- 变量/函数命名见名知意
- 小函数，单一职责
- 避免魔法数字，使用具名常量

### TypeScript/React

```ts
// ✅ 使用 TypeScript strict 模式
// ✅ 服务端组件优先，客户端组件按需使用
// ✅ 避免 any，使用接口/类型定义
```

### Java/Spring Boot

```java
// ✅ 分层架构：Controller → Service → Repository
// ✅ RESTful 风格：GET 查询，POST 创建，PUT 更新，DELETE 删除
// ✅ 使用 Lombok @Data @Builder 减少样板代码
// ✅ 接口命名：findAllById, createArticle, deleteById
```

### Nginx

```nginx
# ✅ 每个 location 注释说明目标服务和端口
# ✅ 跨域配置统一放在 cors.conf 引入
# ✅ 反向代理保留原始 IP: proxy_set_header X-Real-IP
```

## Git 提交

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

## 技术栈

| 领域 | 技术 |
|------|------|
| 前端 | Next.js + TypeScript |
| 后端 | Java Spring Boot / Node.js / Go |
| 网关 | Nginx |
| 数据库 | PostgreSQL + Redis |
| 部署 | Docker Compose |

## 快速命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动所有服务
pnpm --filter web dev # 只启动前端
pnpm build            # 构建全部
pnpm docker:up        # Docker 部署
```

---

**项目概览见** [`README.md`](./README.md)  
**学习笔记见** `docs/learning/`
