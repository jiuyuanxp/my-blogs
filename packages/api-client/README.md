# @blog/api-client

统一 API 客户端，供 web 与 admin 共用。遵循 api-design 规范。

## 功能

- 结构化错误响应 `{ error: { code, message, details? } }`
- 请求超时
- Bearer Token 认证
- `normalizeIds`：将 number id 转为 string，避免 JS 精度丢失

## 使用

```ts
import { createClient, ApiError, isApiError, normalizeIds } from '@blog/api-client';

const api = createClient({
  baseUrl: 'http://localhost:4300',
  getToken: () => localStorage.getItem('admin-token'),
  onUnauthorized: () => localStorage.removeItem('admin-token'),
  defaultTimeout: 10000,
});

const data = await api.get<Article>('/api/articles/1');
```

## 导出

- `createClient(options)` - 创建客户端
- `ApiError` - 错误类
- `isApiError(err)` - 类型守卫
- `normalizeIds(obj)` - ID 标准化
