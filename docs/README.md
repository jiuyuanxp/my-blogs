# 文档目录

本仓库文档按类别组织，便于查阅。

## 目录结构

```
docs/
├── README.md           # 本文件，文档导航
├── DESIGN_INDEX.md     # 设计文档总索引（API、Admin、Web、Java 等）
├── deploy/             # 部署相关
│   ├── DEPLOY.md       # 服务器部署（阿里云 2C2G 纯 Docker）
│   ├── DEPLOY_JAVA.md  # Java 服务部署（PostgreSQL + Redis）
│   └── REDIS_DEPLOY.md # Redis 部署与 Java 集成
├── design/             # 设计文档
│   └── RBAC_DESIGN.md  # RBAC 权限系统设计
├── security/           # 安全相关
│   └── SECURITY.example.md  # 安全清单模板（复制为 SECURITY.md 后填入敏感信息）
└── development/       # 开发指南
    ├── CLAUDE_CODE_COMMANDS.md  # Everything Claude Code 中文指令手册
    └── COMPLIANCE_REVIEW.md     # 规范合规审查记录
```

## 快速链接

| 类别     | 文档                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| **设计** | [DESIGN_INDEX.md](./DESIGN_INDEX.md)                                                     |
| **部署** | [deploy/DEPLOY.md](./deploy/DEPLOY.md)、[deploy/DEPLOY_JAVA.md](./deploy/DEPLOY_JAVA.md) |
| **安全** | [security/SECURITY.example.md](./security/SECURITY.example.md)                           |
| **开发** | [development/CLAUDE_CODE_COMMANDS.md](./development/CLAUDE_CODE_COMMANDS.md)             |
