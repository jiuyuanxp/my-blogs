# 认证 API（待实现）

## POST /api/auth/login

登录获取 Token。

**Request Body:**

```json
{
  "password": "string"
}
```

**Response (200):**

```json
{
  "token": "jwt-token-string"
}
```

**Response (401):**

```json
{
  "error": "密码错误"
}
```

---

## GET /api/auth/check

校验当前 Token 是否有效。

**Headers:** `Authorization: Bearer <token>`

**Response (200):** 空 body

**Response (401):** Token 无效或过期
