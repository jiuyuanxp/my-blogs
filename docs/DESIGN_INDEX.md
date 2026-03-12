# 设计文档索引

本仓库各模块的设计说明文档索引。开发时按模块查阅对应设计文档与规范。

## 设计文档一览

| 模块                   | 路径                                                                          | 说明                                                        |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **API 设计（服务端）** | [services/java/docs/api/](../services/java/docs/api/README.md)                | 接口契约、请求/响应格式、认证、分页；Swagger 生成可交互文档 |
| **Admin 对接**         | [apps/admin/docs/INTEGRATION.md](../apps/admin/docs/INTEGRATION.md)           | 管理后台与 API 对接方式、环境变量、使用接口                 |
| **Admin 设计**         | [apps/admin/docs/DESIGN.md](../apps/admin/docs/DESIGN.md)                     | 管理后台设计、规范引用                                      |
| **Web 对接**           | [apps/web/docs/INTEGRATION.md](../apps/web/docs/INTEGRATION.md)               | 前台与 API 对接方式、评论作者 localStorage                  |
| **Web 设计**           | [apps/web/docs/DESIGN.md](../apps/web/docs/DESIGN.md)                         | 前台设计、移动端适配                                        |
| **Java 服务**          | [services/java/docs/DESIGN.md](../services/java/docs/DESIGN.md)               | 后端架构、DTO、软删除、缓存                                 |
| **数据表设计**         | [services/java/docs/SCHEMA_TABLES.md](../services/java/docs/SCHEMA_TABLES.md) | 表结构、认证说明、admin 密码配置、admin_user 扩展设计       |
| **Redis 部署**         | [docs/deploy/REDIS_DEPLOY.md](./deploy/REDIS_DEPLOY.md)                       | Redis 部署方式、Docker、与 Java 集成                        |
| **RBAC 权限系统**      | [docs/design/RBAC_DESIGN.md](./design/RBAC_DESIGN.md)                         | 用户/角色/权限设计、API、Admin 对接、待讨论项               |

## 规范与技能

| 任务           | 参考                                                  |
| -------------- | ----------------------------------------------------- |
| Admin 前端开发 | web-design-guidelines、vercel-react-best-practices    |
| Web 前端开发   | vercel-react-best-practices、web-interface-guidelines |
| API 设计/实现  | api-design、springboot-patterns                       |
