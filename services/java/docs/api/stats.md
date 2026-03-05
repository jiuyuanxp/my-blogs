# 统计 API

统计接口**需认证**，仅供 admin 仪表盘使用。

## GET /api/stats/summary

统计摘要，按周期聚合。

**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| period | string | day | `day` \| `month` \| `year` |

**Response (200):**

```json
{
  "views": [
    { "date": "2024-03-01", "count": 120 },
    { "date": "2024-03-02", "count": 340 },
    { "date": "2024-03-03", "count": 180 }
  ],
  "adds": [
    { "date": "2024-03-01", "count": 2 },
    { "date": "2024-03-02", "count": 1 }
  ],
  "deletes": [
    { "date": "2024-03-01", "count": 0 },
    { "date": "2024-03-02", "count": 0 }
  ],
  "comments": [
    { "date": "2024-03-01", "count": 0 },
    { "date": "2024-03-02", "count": 1 }
  ]
}
```

**说明：**

- `views`: 每日/月/年浏览量（按 period 聚合）
- `adds`: 新增文章数
- `deletes`: 删除文章数
- `comments`: 新增评论数
- `date` 格式：day 为 `yyyy-MM-dd`，month 为 `yyyy-MM`，year 为 `yyyy`

---

## GET /api/stats/popular-views

热门文章浏览排行。

**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| limit | number | 10 | 返回条数 |

**Response (200):**

```json
[
  { "id": 1, "title": "Next.js 16 新特性解析", "views": 1280 },
  { "id": 2, "title": "Spring Boot 3 实践指南", "views": 856 }
]
```

---

## GET /api/stats/popular-comments

热门文章评论排行。

**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| limit | number | 10 | 返回条数 |

**Response (200):**

```json
[
  { "id": 1, "title": "Next.js 16 新特性解析", "commentCount": 15 },
  { "id": 2, "title": "Spring Boot 3 实践指南", "commentCount": 8 }
]
```

**说明：** 仅统计未软删的评论。
