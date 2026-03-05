# 文章 API

## GET /api/articles

获取文章列表。

**认证：**

- 未认证：仅返回 `status=published` 的文章
- 已认证（admin）：可通过 `all=true` 查询全部（含 draft）

**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| categoryId | number | - | 按分类筛选（含子分类文章） |
| status | string | - | `draft` \| `published`，仅认证时有效 |
| all | boolean | false | 仅认证时有效，true 返回全部 |
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页条数，最大 100 |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "categoryId": 2,
      "categoryName": "前端",
      "title": "Next.js 16 新特性解析",
      "summary": "简介...",
      "content": "# 简介\n\n...",
      "status": "published",
      "views": 1280,
      "isPinned": 0,
      "createdAt": "2024-03-01T10:00:00Z",
      "updatedAt": "2024-03-02T15:30:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

**说明：**

- `categoryName` 由后端关联查询填充，便于列表展示
- `status`: `draft` | `published`
- `isPinned`: 0 或 1，置顶排序时优先

---

## GET /api/articles/:id

获取文章详情。

**认证：** 否（公开）

**Response (200):**

```json
{
  "id": 1,
  "categoryId": 2,
  "categoryName": "前端",
  "title": "Next.js 16 新特性解析",
  "summary": "简介...",
  "content": "# 简介\n\n...",
  "status": "published",
  "views": 1281,
  "isPinned": 0,
  "createdAt": "2024-03-01T10:00:00Z",
  "updatedAt": "2024-03-02T15:30:00Z"
}
```

**实现要点：**

- 可在此接口内增加浏览量 `views`（防刷可选：IP/会话限频）

**Response (404):** 文章不存在或未发布（未认证时）

---

## POST /api/articles

创建文章。

**认证：** 是

**Request Body:**

```json
{
  "categoryId": 2,
  "title": "文章标题",
  "summary": "摘要（可选）",
  "content": "# Markdown 内容",
  "status": "draft",
  "isPinned": 0
}
```

- `categoryId`: 必填
- `title`: 必填，最大 200 字符
- `summary`: 可选，最大 500 字符
- `content`: 必填
- `status`: `draft` | `published`，默认 `draft`
- `isPinned`: 0 | 1，默认 0

**Response (201):** 同 GET 详情结构

**Response (422):** 校验失败（如 categoryId 不存在）

---

## PUT /api/articles/:id

更新文章。

**认证：** 是

**Request Body:** 同 POST，字段均可选（部分更新时只传需更新字段）

**Response (200):** 同 GET 详情

**Response (404):** 文章不存在

---

## DELETE /api/articles/:id

删除文章。**硬删除**，不可恢复。

**认证：** 是

**Response (204):** No Content

**Response (404):** 文章不存在
