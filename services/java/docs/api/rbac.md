# RBAC 权限 API

基于角色的访问控制（RBAC），支持菜单-按钮树形结构。

**超级管理员（super_admin）**：角色编码固定为 `super_admin`，拥有所有权限、不可修改、不可删除、不可分配权限；创建用户时不可分配该角色；超级管理员用户不可编辑、删除、重置密码。

## 权限 (Permission)

### GET /api/permissions

权限列表。`type=menu|button` 时返回扁平列表，否则返回树形（含 children）。

**Query:** `type` (可选) menu | button

**Response (200):** 树形或扁平 `PermissionDto[]`

```json
[
  {
    "id": 1,
    "code": "menu:users",
    "name": "用户管理",
    "type": "menu",
    "parentId": null,
    "routePath": "/users",
    "component": null,
    "isHidden": false,
    "sortOrder": 5,
    "children": [
      {
        "id": 10,
        "code": "btn:user:create",
        "name": "新建用户",
        "type": "button",
        "parentId": 1,
        "routePath": null,
        "component": null,
        "isHidden": false,
        "sortOrder": 9,
        "children": []
      }
    ],
    "createdAt": "2024-03-01 10:00:00"
  }
]
```

### POST /api/permissions

创建权限。按钮的 parentId 必须指向菜单。

**Request Body:**

```json
{
  "code": "btn:user:create",
  "name": "新建用户",
  "type": "button",
  "parentId": 1,
  "routePath": null,
  "component": null,
  "isHidden": false,
  "sortOrder": 1
}
```

### PUT /api/permissions/:id

更新权限。

### DELETE /api/permissions/:id

删除权限。若有子权限则递归删除；若被角色引用则报错。

---

## 角色 (Role)

### GET /api/roles

角色列表。

### GET /api/roles/:id

角色详情，含 permissionIds。

### POST /api/roles

创建角色。不能创建 code=super_admin。

### PUT /api/roles/:id

更新角色。不能修改 super_admin。

### PUT /api/roles/:id/permissions

分配权限。先删旧关联再插入新关联。不能修改 super_admin 权限。

**Request Body:** `{ "permissionIds": [1, 2, 3] }`

### DELETE /api/roles/:id

删除角色。不能删除 super_admin；若角色下有用户则报错。

---

## 用户 (User)

### GET /api/users

分页用户列表。

**Query:** `page`, `pageSize`

**Response:** `{ data: UserDto[], meta: { total, page, pageSize, totalPages } }`

### GET /api/users/:id

用户详情。

### POST /api/users

创建用户。不能分配 super_admin 角色。

### PUT /api/users/:id

更新用户。不能修改 super_admin 用户。

### POST /api/users/:id/reset-password

重置密码。不能重置 super_admin 密码。

### DELETE /api/users/:id

删除用户。不能删除 super_admin。

---

## 认证扩展

### GET /api/auth/me

当前用户信息及权限 code 列表。

### GET /api/auth/menus

当前用户可见的菜单树（用于动态路由）。超级管理员返回全部菜单。
