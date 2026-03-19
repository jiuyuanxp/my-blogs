# 分类 API

分类为**树形结构**，`parent_id` 为 null 表示根分类。

## GET /api/categories

获取分类树。**树形返回**，每个节点含 `children` 数组。

**认证：** 否（公开）

**Response (200):**

```json
[
  {
    "id": 1,
    "parentId": null,
    "name": "技术",
    "createdAt": "2024-01-01 00:00:00",
    "children": [
      {
        "id": 2,
        "parentId": 1,
        "name": "前端",
        "createdAt": "2024-01-01 00:00:00",
        "children": []
      },
      {
        "id": 3,
        "parentId": 1,
        "name": "后端",
        "createdAt": "2024-01-01 00:00:00",
        "children": []
      }
    ]
  },
  {
    "id": 4,
    "parentId": null,
    "name": "随笔",
    "createdAt": "2024-01-01 00:00:00",
    "children": []
  }
]
```

**实现要点：**

- 后端可先查扁平列表，再在 Service 层组装树；或提供 `?format=tree` 与 `?format=flat` 两种格式
- 字段命名：camelCase（与前端 TypeScript 一致）

---

## POST /api/categories

创建分类。

**认证：** 是

**Request Body:**

```json
{
  "name": "前端",
  "parentId": 1
}
```

- `name`: 必填，最大 100 字符
- `parentId`: 可选，null 表示根分类

**Response (201):**

```json
{
  "id": 2,
  "parentId": 1,
  "name": "前端",
  "createdAt": "2024-03-01 10:00:00"
}
```

**Response (422):** 父分类不存在、名称重复等

---

## PUT /api/categories/:id

更新分类。

**认证：** 是

**Request Body:**

```json
{
  "name": "前端开发",
  "parentId": 1
}
```

**Response (200):** 同 POST 响应结构

**Response (404):** 分类不存在

**Response (422):** 不能将父级设为自己或自己的子节点（形成环）

---

## DELETE /api/categories/:id

删除分类。

**认证：** 是

**Response (204):** No Content

**Response (409):**

```json
{
  "error": {
    "code": "category_in_use",
    "message": "该分类下存在子分类或文章，无法删除"
  }
}
```
