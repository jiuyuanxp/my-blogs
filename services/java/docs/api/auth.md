# 认证 API

认证采用**简单 Token** 方案：固定密码校验，通过后返回随机 token，服务端存储（内存或 Redis）。

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
  "token": "a1b2c3d4e5f6..."
}
```

**Response (401):**

```json
{
  "error": {
    "code": "invalid_password",
    "message": "密码错误"
  }
}
```

**实现要点：**

- 密码从环境变量 `ADMIN_PASSWORD` 读取，不硬编码
- Token 为随机字符串（如 UUID），存入内存 Map 或 Redis，TTL 可配置（如 7 天）
- 不实现多用户，单密码即可

---

## GET /api/auth/check

校验当前 Token 是否有效。

**Headers:** `Authorization: Bearer <token>`

**Response (200):** 空 body 或 `{ "valid": true }`

**Response (401):**

```json
{
  "error": {
    "code": "invalid_token",
    "message": "Token 无效或已过期"
  }
}
```

---

## POST /api/auth/logout（可选）

登出，服务端使 Token 失效。前端也可直接清除 localStorage 中的 token。

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No Content
