# API 契约规范 (Single Source of Truth)

> 本文档定义前后端通信的 JSON 格式与状态码规范，为所有 Agent 与前后端开发的唯一契约来源。详细接口设计见 `services/java/docs/api/`。

## 一、通用约定

### 1.1 请求

| 项目             | 规范                                         |
| ---------------- | -------------------------------------------- |
| **Content-Type** | `application/json`                           |
| **认证**         | `Authorization: Bearer <token>`              |
| **Base URL**     | 生产环境 `/api`（由 Nginx 代理至 Java 服务） |

### 1.2 时间格式

- 统一使用 **ISO 8601**：`2024-03-01T10:00:00Z`（UTC）

### 1.3 分页参数

| 参数       | 类型   | 默认 | 说明               |
| ---------- | ------ | ---- | ------------------ |
| `page`     | number | 1    | 页码，从 1 起      |
| `pageSize` | number | 20   | 每页条数，最大 100 |

---

## 二、成功响应格式

### 2.1 单资源

直接返回资源对象，**不**包裹在 `data` 或 `code` 中。

```json
{
  "id": 1,
  "title": "文章标题",
  "content": "...",
  "createdAt": "2024-03-01T10:00:00Z"
}
```

### 2.2 分页列表

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

| 字段              | 类型   | 说明           |
| ----------------- | ------ | -------------- |
| `data`            | array  | 当前页数据列表 |
| `meta.total`      | number | 总记录数       |
| `meta.page`       | number | 当前页码       |
| `meta.pageSize`   | number | 每页条数       |
| `meta.totalPages` | number | 总页数         |

### 2.3 树形结构（如分类）

```json
[
  {
    "id": 1,
    "name": "父分类",
    "children": [{ "id": 2, "name": "子分类", "children": [] }]
  }
]
```

---

## 三、错误响应格式

所有错误统一使用以下结构：

```json
{
  "error": {
    "code": "错误码（机器可读）",
    "message": "用户可读的错误描述",
    "details": [
      {
        "field": "字段名",
        "message": "字段级错误信息",
        "code": "校验码"
      }
    ]
  }
}
```

| 字段            | 类型   | 必填 | 说明                                                |
| --------------- | ------ | ---- | --------------------------------------------------- |
| `error.code`    | string | 是   | 如 `validation_error`、`not_found`、`invalid_token` |
| `error.message` | string | 是   | 人类可读描述                                        |
| `error.details` | array  | 否   | 校验错误时提供，每项含 `field`、`message`、`code`   |

### 3.1 常见错误码

| code               | HTTP 状态码 | 说明                 |
| ------------------ | ----------- | -------------------- |
| `validation_error` | 422         | 请求参数校验失败     |
| `not_found`        | 404         | 资源不存在           |
| `invalid_argument` | 400         | 非法参数             |
| `invalid_password` | 401         | 密码错误             |
| `invalid_token`    | 401         | Token 无效或过期     |
| `category_in_use`  | 409         | 分类被引用，无法删除 |
| `internal_error`   | 500         | 服务器内部错误       |

---

## 四、HTTP 状态码规范

| 状态码 | 含义                  | 典型场景                             |
| ------ | --------------------- | ------------------------------------ |
| 200    | OK                    | 成功返回单资源或列表                 |
| 201    | Created               | 创建成功（可选，当前项目多直接 200） |
| 204    | No Content            | 删除成功，无响应体                   |
| 400    | Bad Request           | 非法参数、格式错误                   |
| 401    | Unauthorized          | 未认证或 Token 无效                  |
| 404    | Not Found             | 资源不存在                           |
| 409    | Conflict              | 业务冲突（如分类被引用）             |
| 422    | Unprocessable Entity  | 校验失败、业务规则不满足             |
| 500    | Internal Server Error | 未捕获异常                           |

---

## 五、接口清单索引

| 模块 | 方法                | 路径               | 认证 | 详细设计      |
| ---- | ------------------- | ------------------ | ---- | ------------- |
| 认证 | POST                | `/api/auth/login`  | 否   | auth.md       |
| 认证 | GET                 | `/api/auth/check`  | 是   | auth.md       |
| 认证 | POST                | `/api/auth/logout` | 是   | auth.md       |
| 分类 | GET                 | `/api/categories`  | 否   | categories.md |
| 分类 | POST/PUT/DELETE     | `/api/categories`  | 是   | categories.md |
| 文章 | GET/POST/PUT/DELETE | `/api/articles`    | 部分 | articles.md   |
| 评论 | GET/POST/DELETE     | `/api/comments`    | 部分 | comments.md   |
| 统计 | GET                 | `/api/stats/*`     | 是   | stats.md      |

完整接口定义与请求/响应示例见 `services/java/docs/api/`，可交互文档启动后访问 `/doc.html`。

---

## 六、前端类型同步

- `packages/types` 中的 TypeScript 接口必须与 Java DTO 严格对应
- 后端 DTO 变更时，必须同步更新前端类型
- 使用 `@blog/api-client` 统一发起请求，封装错误解析与 Token 传递

---

**更新原则**：API 契约变更时，必须同步更新本文档及 `services/java/docs/api/` 对应设计文档。
