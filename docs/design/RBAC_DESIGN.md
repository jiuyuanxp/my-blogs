# RBAC 权限系统设计文档

> 设计已确认，可进入实现阶段。

## 一、目标与范围

### 1.1 目标

- 移除单密码方案，改为基于用户表的登录
- 实现 RBAC（Role-Based Access Control）权限系统
- Admin 端支持：用户管理、角色管理、权限管理
- 菜单与按钮按权限控制显示/禁用
- 超级管理员仅能通过数据库手动创建，拥有全部权限

### 1.2 范围

| 模块       | 说明                                                           |
| ---------- | -------------------------------------------------------------- |
| Java 后端  | 用户表、角色表、权限表、登录/鉴权、CRUD API                    |
| Admin 前端 | 登录（用户名+密码）、用户/角色/权限管理页面、菜单/按钮权限控制 |

---

## 二、数据模型设计

### 2.1 表结构

```
┌─────────────┐                    ┌─────────────┐
│   users     │─── role_id ──────>│   roles     │
└─────────────┘                    └──────┬──────┘
       │                                  │
       │                          ┌───────┴───────┐
       │                          │ role_permissions│
       │                          └───────┬───────┘
       │                                  │
       │                          ┌───────┴──────┐
       │                          │  permissions │
       │                          └──────────────┘
       │
       └─── 登录时：校验密码 → 查用户 → 查角色 → 查权限 → 返回 token + 权限列表
```

> **已确认**：一个用户仅一个角色，users 表直接 `role_id` FK 到 roles，无需 user_roles 中间表。

### 2.2 表定义

#### users（用户表）

| 列名          | 类型         | 约束            | 说明                               |
| ------------- | ------------ | --------------- | ---------------------------------- |
| id            | BIGSERIAL    | PK              | 主键                               |
| username      | VARCHAR(50)  | NOT NULL UNIQUE | 登录名                             |
| password_hash | VARCHAR(255) | NOT NULL        | BCrypt 哈希                        |
| nickname      | VARCHAR(100) | nullable        | 昵称/显示名                        |
| role_id       | BIGINT       | NOT NULL FK     | 角色 ID，一个用户仅一个角色        |
| status        | VARCHAR(20)  | NOT NULL        | active \| disabled，禁用后禁止登录 |
| created_at    | TIMESTAMP    | NOT NULL        | 创建时间                           |
| updated_at    | TIMESTAMP    | nullable        | 更新时间                           |

#### roles（角色表）

| 列名        | 类型         | 约束            | 说明                       |
| ----------- | ------------ | --------------- | -------------------------- |
| id          | BIGSERIAL    | PK              | 主键                       |
| code        | VARCHAR(50)  | NOT NULL UNIQUE | 角色编码，如 admin、editor |
| name        | VARCHAR(100) | NOT NULL        | 角色名称                   |
| description | VARCHAR(255) | nullable        | 描述                       |
| created_at  | TIMESTAMP    | NOT NULL        | 创建时间                   |
| updated_at  | TIMESTAMP    | nullable        | 更新时间                   |

#### permissions（权限表）

| 列名       | 类型         | 约束            | 说明                                           |
| ---------- | ------------ | --------------- | ---------------------------------------------- |
| id         | BIGSERIAL    | PK              | 主键                                           |
| code       | VARCHAR(100) | NOT NULL UNIQUE | 权限编码，如 menu:articles、btn:article:delete |
| name       | VARCHAR(100) | NOT NULL        | 权限名称                                       |
| type       | VARCHAR(20)  | NOT NULL        | menu \| button                                 |
| parent_id  | BIGINT       | nullable        | 父权限（菜单层级用）                           |
| sort_order | INTEGER      | NOT NULL        | 排序，用于菜单顺序                             |
| created_at | TIMESTAMP    | NOT NULL        | 创建时间                                       |
| updated_at | TIMESTAMP    | nullable        | 更新时间                                       |

**权限编码约定**：

- 菜单：`menu:<模块>`，如 `menu:dashboard`、`menu:articles`、`menu:users`
- 按钮：`btn:<模块>:<动作>`，如 `btn:article:create`、`btn:article:delete`、`btn:user:edit`

#### role_permissions（角色-权限关联）

| 列名          | 类型      | 约束     | 说明     |
| ------------- | --------- | -------- | -------- |
| role_id       | BIGINT    | PK, FK   | 角色 ID  |
| permission_id | BIGINT    | PK, FK   | 权限 ID  |
| created_at    | TIMESTAMP | NOT NULL | 创建时间 |

- 联合主键 (role_id, permission_id)

---

## 三、超级管理员

### 3.1 创建方式

- **仅通过数据库手动创建**，不提供 Admin 界面创建
- 提供可执行脚本 `services/java/scripts/init-super-admin.sh`（或 .sql + 说明），**脚本不提交 Git**，加入 `.gitignore`
- 文档说明脚本用法及 BCrypt 生成方式

### 3.2 超级管理员标识

- 方案 A：**特殊角色** `super_admin`，该角色拥有所有权限（逻辑上“所有权限”）
- 方案 B：**不建特殊角色**，在代码中硬编码：若用户拥有 `super_admin` 角色，则跳过权限校验

推荐 **方案 B**：`super_admin` 角色在数据库存在，但 role_permissions 中不为其配置任何权限；在鉴权逻辑中，若用户角色包含 `super_admin`，则直接放行。

### 3.3 初始化脚本示例

脚本路径：`services/java/scripts/init-super-admin.sh`（不提交 Git）

```sql
-- 1. 创建 super_admin 角色
INSERT INTO roles (code, name, description, created_at, updated_at)
VALUES ('super_admin', '超级管理员', '拥有所有权限，仅能手动创建', NOW(), NOW());

-- 2. 创建超级管理员用户（密码由脚本参数传入，BCrypt 在 Java 或脚本内生成）
INSERT INTO users (username, password_hash, nickname, role_id, status, created_at, updated_at)
SELECT 'superadmin', :passwordHash, '超级管理员', r.id, 'active', NOW(), NOW()
FROM roles r WHERE r.code = 'super_admin';
```

---

## 四、权限清单（菜单 + 按钮）

### 4.1 菜单权限

| 权限编码         | 名称     | 对应 Admin 页面     |
| ---------------- | -------- | ------------------- |
| menu:dashboard   | 仪表盘   | Dashboard           |
| menu:categories  | 分类管理 | Categories          |
| menu:articles    | 文章管理 | Articles            |
| menu:comments    | 评论管理 | Comments            |
| menu:users       | 用户管理 | Users（新增）       |
| menu:roles       | 角色管理 | Roles（新增）       |
| menu:permissions | 权限管理 | Permissions（新增） |
| menu:design      | 设计规范 | DesignSystem        |
| menu:about       | 项目说明 | ProjectInfo         |

### 4.2 按钮权限（示例）

| 权限编码              | 名称     | 对应操作         |
| --------------------- | -------- | ---------------- |
| btn:category:create   | 新建分类 | Categories 新建  |
| btn:category:edit     | 编辑分类 | Categories 编辑  |
| btn:category:delete   | 删除分类 | Categories 删除  |
| btn:article:create    | 新建文章 | Articles 新建    |
| btn:article:edit      | 编辑文章 | Articles 编辑    |
| btn:article:delete    | 删除文章 | Articles 删除    |
| btn:article:publish   | 发布文章 | Articles 发布    |
| btn:comment:delete    | 删除评论 | Comments 删除    |
| btn:user:create       | 新建用户 | Users 新建       |
| btn:user:edit         | 编辑用户 | Users 编辑       |
| btn:user:delete       | 删除用户 | Users 删除       |
| btn:user:reset_pwd    | 重置密码 | Users 重置密码   |
| btn:role:create       | 新建角色 | Roles 新建       |
| btn:role:edit         | 编辑角色 | Roles 编辑       |
| btn:role:delete       | 删除角色 | Roles 删除       |
| btn:role:assign       | 分配权限 | Roles 分配权限   |
| btn:permission:create | 新建权限 | Permissions 新建 |
| btn:permission:edit   | 编辑权限 | Permissions 编辑 |
| btn:permission:delete | 删除权限 | Permissions 删除 |

---

## 五、API 设计

### 5.1 认证变更

| 接口                 | 变更                                                  | 说明                                               |
| -------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| POST /api/auth/login | 请求体 `{ username, password, rememberMe?: boolean }` | 用户名+密码，记住我可选                            |
| GET /api/auth/me     | 新增                                                  | 返回当前用户信息 + 权限列表，用于前端渲染菜单/按钮 |

- **Token 过期**：可配置（如 `app.auth.token-ttl-hours`），记住我时可选更长 TTL（如 30 天）
- **禁用用户**：`status=disabled` 禁止登录，返回 401

**GET /api/auth/me 响应示例**：

```json
{
  "id": 1,
  "username": "admin",
  "nickname": "管理员",
  "role": "admin",
  "permissions": ["menu:dashboard", "menu:articles", "btn:article:create", ...]
}
```

### 5.2 用户管理 API

| 方法   | 路径                          | 说明                     |
| ------ | ----------------------------- | ------------------------ |
| GET    | /api/users                    | 用户列表（分页）         |
| POST   | /api/users                    | 创建用户                 |
| GET    | /api/users/:id                | 用户详情                 |
| PUT    | /api/users/:id                | 更新用户                 |
| DELETE | /api/users/:id                | 删除用户（软删除或禁用） |
| POST   | /api/users/:id/reset-password | 重置密码（管理员操作）   |

### 5.3 角色管理 API

| 方法   | 路径                       | 说明               |
| ------ | -------------------------- | ------------------ |
| GET    | /api/roles                 | 角色列表           |
| POST   | /api/roles                 | 创建角色           |
| GET    | /api/roles/:id             | 角色详情（含权限） |
| PUT    | /api/roles/:id             | 更新角色           |
| PUT    | /api/roles/:id/permissions | 分配权限           |
| DELETE | /api/roles/:id             | 删除角色           |

### 5.4 权限管理 API

| 方法   | 路径                 | 说明                           |
| ------ | -------------------- | ------------------------------ |
| GET    | /api/permissions     | 权限列表（树形，按 type 过滤） |
| POST   | /api/permissions     | 创建权限                       |
| PUT    | /api/permissions/:id | 更新权限                       |
| DELETE | /api/permissions/:id | 删除权限                       |

### 5.5 鉴权规则

- 所有 `/api/users`、`/api/roles`、`/api/permissions` 需认证
- 鉴权时：若用户有 `super_admin` 角色，则放行；否则检查 `permissions` 是否包含所需权限
- 建议使用 `@PreAuthorize("hasPermission('menu:users')")` 或自定义 `PermissionEvaluator`

---

## 六、Admin 前端设计

### 6.1 登录页

- 输入：用户名、密码、「记住我」复选框
- 调用 `POST /api/auth/login`，`rememberMe=true` 时请求更长 Token TTL
- 登录成功后调用 `GET /api/auth/me` 获取权限列表，存 `localStorage` 或 Context

### 6.2 菜单权限

- 侧边栏：根据 `permissions` 过滤 `navItems`，只显示用户有 `menu:*` 权限的项
- 新增菜单：用户管理、角色管理、权限管理

### 6.3 按钮权限

- 每个页面内按钮（新建、编辑、删除等）根据 `permissions` 控制：
  - 有权限：正常显示
  - 无权限：隐藏或禁用（推荐隐藏，避免暴露功能）

### 6.4 权限校验封装

```ts
// 示例
const hasPermission = (code: string) => permissions.includes(code);
const hasMenu = (menu: string) => hasPermission(`menu:${menu}`);
const hasButton = (module: string, action: string) => hasPermission(`btn:${module}:${action}`);
```

---

## 七、实现顺序建议

| 阶段 | 内容                                                              | 依赖   |
| ---- | ----------------------------------------------------------------- | ------ |
| 1    | 数据库表：users, roles, permissions, user_roles, role_permissions | 无     |
| 2    | 权限种子数据：初始化菜单 + 按钮权限                               | 权限表 |
| 3    | 用户登录：username + password，BCrypt 校验                        | users  |
| 4    | Token 携带用户 ID，登录时查权限                                   | 1      |
| 5    | GET /api/auth/me                                                  | 4      |
| 6    | 用户管理 CRUD API                                                 | 1      |
| 7    | 角色管理 CRUD API                                                 | 1      |
| 8    | 权限管理 CRUD API                                                 | 1      |
| 9    | 鉴权：`@PreAuthorize` 或 Filter                                   | 4      |
| 10   | Admin 登录页改为用户名+密码                                       | 3      |
| 11   | Admin 菜单/按钮权限控制                                           | 5      |
| 12   | Admin 用户/角色/权限管理页面                                      | 6,7,8  |
| 13   | 超级管理员初始化脚本（不提交 Git）                                | 1      |

---

## 八、已确认决策

| 项               | 决策                                         |
| ---------------- | -------------------------------------------- |
| 用户多角色       | 不支持，一个用户仅一个角色，users.role_id FK |
| 角色继承         | 不做                                         |
| 权限范围         | 全部实现（菜单 + 按钮清单）                  |
| super_admin 创建 | 提供可执行脚本，**不提交 Git**（.gitignore） |
| 禁用用户         | 禁止登录                                     |
| Token            | 保留「记住我」、Token 过期时间可配置         |
