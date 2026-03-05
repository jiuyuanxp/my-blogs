# 评论 API

评论支持**软删除**，后台可查看已删除评论。

## GET /api/comments

获取评论列表。**需认证**（admin 用）。

**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| articleId | number | - | 按文章筛选 |
| categoryId | number | - | 按分类筛选（该分类下文章的评论） |
| includeDeleted | boolean | false | 是否包含已软删评论 |
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页条数 |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "articleId": 1,
      "articleTitle": "Next.js 16 新特性解析",
      "authorName": "User1234",
      "content": "写得很好！",
      "createdAt": "2024-03-02T14:20:00Z",
      "deletedAt": null
    },
    {
      "id": 2,
      "articleId": 1,
      "articleTitle": "Next.js 16 新特性解析",
      "authorName": "匿名",
      "content": "已删除的评论内容",
      "createdAt": "2024-03-03T10:00:00Z",
      "deletedAt": "2024-03-04T09:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

**说明：**

- `articleTitle` 由后端关联查询
- `deletedAt` 非 null 表示已软删，`includeDeleted=true` 时返回

---

## POST /api/comments

发表评论。**公开接口**，无需认证。

**Request Body:**

```json
{
  "articleId": 1,
  "authorName": "User1234",
  "content": "评论内容"
}
```

- `articleId`: 必填
- `authorName`: 必填，最大 50 字符。web 端由前端随机生成，用户可修改，存 localStorage
- `content`: 必填，最大 2000 字符

**Response (201):**

```json
{
  "id": 3,
  "articleId": 1,
  "authorName": "User1234",
  "content": "评论内容",
  "createdAt": "2024-03-05T10:00:00Z"
}
```

**Response (404):** 文章不存在或未发布

**Response (422):** 校验失败

---

## DELETE /api/comments/:id

软删除评论。**需认证**。

**Response (204):** No Content

**Response (404):** 评论不存在

**实现要点：**

- 设置 `deleted_at` 时间戳，不物理删除
- 公开的文章详情页不返回已软删评论
- admin 列表通过 `includeDeleted=true` 查看
