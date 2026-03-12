# 数据表设计文档

本仓库数据表设计说明，对应 `com.blog.repository` 包下的 JPA Entity 与 Repository。开发时参考此文档理解表结构、索引与业务约束。

## 认证说明

Admin 登录已改为 **RBAC 用户表** 方案：

- 用户表 `users` 存储用户名、BCrypt 密码哈希、角色
- 登录：`POST /api/auth/login` 传入 `{ username, password, rememberMe? }`
- 超级管理员：仅能通过 `services/java/scripts/init-super-admin.sh` 手动创建，见 [RBAC 设计](../../docs/design/RBAC_DESIGN.md)

---

## 现有表结构

### users（用户）

| 列名          | 类型         | 约束            | 说明               |
| ------------- | ------------ | --------------- | ------------------ |
| id            | BIGSERIAL    | PK              | 主键               |
| username      | VARCHAR(50)  | NOT NULL UNIQUE | 登录名             |
| password_hash | VARCHAR(255) | NOT NULL        | BCrypt 哈希        |
| nickname      | VARCHAR(100) | nullable        | 昵称               |
| role_id       | BIGINT       | NOT NULL FK     | 角色 ID            |
| status        | VARCHAR(20)  | NOT NULL        | active \| disabled |
| created_at    | TIMESTAMP    | NOT NULL        | 创建时间           |
| updated_at    | TIMESTAMP    | nullable        | 更新时间           |

### roles（角色）

| 列名        | 类型         | 约束            | 说明     |
| ----------- | ------------ | --------------- | -------- |
| id          | BIGSERIAL    | PK              | 主键     |
| code        | VARCHAR(50)  | NOT NULL UNIQUE | 角色编码 |
| name        | VARCHAR(100) | NOT NULL        | 角色名称 |
| description | VARCHAR(255) | nullable        | 描述     |
| created_at  | TIMESTAMP    | NOT NULL        | 创建时间 |
| updated_at  | TIMESTAMP    | nullable        | 更新时间 |

### permissions（权限）

| 列名       | 类型         | 约束            | 说明           |
| ---------- | ------------ | --------------- | -------------- |
| id         | BIGSERIAL    | PK              | 主键           |
| code       | VARCHAR(100) | NOT NULL UNIQUE | 权限编码       |
| name       | VARCHAR(100) | NOT NULL        | 权限名称       |
| type       | VARCHAR(20)  | NOT NULL        | menu \| button |
| parent_id  | BIGINT       | nullable        | 父权限 ID      |
| sort_order | INTEGER      | NOT NULL        | 排序           |
| created_at | TIMESTAMP    | NOT NULL        | 创建时间       |
| updated_at | TIMESTAMP    | nullable        | 更新时间       |

### role_permissions（角色-权限关联）

| 列名          | 类型      | 约束        | 说明     |
| ------------- | --------- | ----------- | -------- |
| id            | BIGSERIAL | PK          | 主键     |
| role_id       | BIGINT    | NOT NULL FK | 角色 ID  |
| permission_id | BIGINT    | NOT NULL FK | 权限 ID  |
| created_at    | TIMESTAMP | NOT NULL    | 创建时间 |

---

### categories（分类）

| 列名       | 类型         | 约束     | 说明                 |
| ---------- | ------------ | -------- | -------------------- |
| id         | BIGSERIAL    | PK       | 主键                 |
| parent_id  | BIGINT       | nullable | 父分类 ID，根为 NULL |
| name       | VARCHAR(100) | NOT NULL | 分类名称             |
| created_at | TIMESTAMP    | NOT NULL | 创建时间             |

- 邻接表结构，支持树形分类
- Entity: `com.blog.model.Category`
- Repository: `com.blog.repository.CategoryRepository`

---

### articles（文章）

| 列名        | 类型         | 约束     | 说明                     |
| ----------- | ------------ | -------- | ------------------------ |
| id          | BIGSERIAL    | PK       | 主键                     |
| category_id | BIGINT       | NOT NULL | 分类 ID，外键 categories |
| title       | VARCHAR(200) | NOT NULL | 标题                     |
| summary     | VARCHAR(500) | nullable | 摘要                     |
| content     | TEXT         | NOT NULL | 正文                     |
| status      | VARCHAR(20)  | NOT NULL | draft \| published       |
| view_count  | INTEGER      | NOT NULL | 浏览量，默认 0           |
| is_pinned   | INTEGER      | NOT NULL | 是否置顶，0/1            |
| created_at  | TIMESTAMP    | NOT NULL | 创建时间                 |
| updated_at  | TIMESTAMP    | nullable | 更新时间                 |

- Entity: `com.blog.model.Article`
- Repository: `com.blog.repository.ArticleRepository`

---

### comments（评论）

| 列名        | 类型        | 约束     | 说明                      |
| ----------- | ----------- | -------- | ------------------------- |
| id          | BIGSERIAL   | PK       | 主键                      |
| article_id  | BIGINT      | NOT NULL | 文章 ID，外键 articles    |
| author_name | VARCHAR(50) | NOT NULL | 作者名（前端生成）        |
| content     | TEXT        | NOT NULL | 评论内容                  |
| created_at  | TIMESTAMP   | NOT NULL | 创建时间                  |
| deleted_at  | TIMESTAMP   | nullable | 软删除时间，NULL 表示未删 |

- 软删除：删除时设置 `deleted_at`，查询默认 `WHERE deleted_at IS NULL`
- Entity: `com.blog.model.Comment`
- Repository: `com.blog.repository.CommentRepository`

---

## 扩展设计：admin_user（可选）

若将来支持多管理员或需将密码存入数据库，可新增 `admin_user` 表：

| 列名          | 类型         | 约束            | 说明                  |
| ------------- | ------------ | --------------- | --------------------- |
| id            | BIGSERIAL    | PK              | 主键                  |
| username      | VARCHAR(50)  | NOT NULL UNIQUE | 登录名                |
| password_hash | VARCHAR(255) | NOT NULL        | BCrypt 哈希，不存明文 |
| created_at    | TIMESTAMP    | NOT NULL        | 创建时间              |
| updated_at    | TIMESTAMP    | nullable        | 更新时间              |

- 密码必须使用 BCrypt 等单向哈希，绝不存明文
- 实现时需修改 `TokenService` 从数据库校验，并保留环境变量作为 fallback（如首次部署引导）

---

## 表关系示意

```
categories (parent_id 自引用)
    ↑
articles (category_id → categories.id)
    ↑
comments (article_id → articles.id)
```

---

## 迁移与 DDL

- 当前使用 JPA `ddl-auto: update`，表结构由 Entity 自动同步
- 生产环境建议改为 `validate` 或使用 Flyway/Liquibase 管理迁移
