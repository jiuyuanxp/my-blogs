# 规范合规审查

对照 api-design、web-design-guidelines 等技能对项目代码的审查与改进记录。

## 工作流：先看规范再写代码

书写新代码前，必须先查阅相关规范。详见 `.cursor/rules/15-spec-first.mdc`。

## API 客户端（api-design 技能）

### 已改进

| 规范项 | 改进内容 |
|--------|----------|
| **错误格式** | 新增 `ApiError` 类，解析后端 `{ error: { code, message, details? } }`，透传 `code`、`message`、`details` |
| **请求超时** | 使用 `AbortController`，默认 10s 超时，超时抛出 `ApiError`（code: `timeout`） |
| **401 处理** | 401 时自动调用 `onUnauthorized`（清除 token），并抛出结构化 `ApiError` |
| **类型安全** | 抽离 `@blog/api-client` 共享包，`createClient` 返回 `get/post/put/delete` 方法 |
| **错误透传** | 页面使用 `isApiError(err)` 获取后端返回的 `message`，业务错误（如 `invalid_password`、`category_in_use`）可正确展示 |

### 共享包结构

```
packages/api-client/
├── src/index.ts   # ApiError, createClient, normalizeIds
├── package.json
└── tsconfig.json
```

### 使用示例

```ts
import { createClient, ApiError, isApiError } from '@blog/api-client';

const api = createClient({
  baseUrl: 'http://localhost:4300',
  getToken: () => localStorage.getItem('admin-token'),
  onUnauthorized: () => localStorage.removeItem('admin-token'),
  defaultTimeout: 10000,
});

// 请求
const data = await api.get<Article[]>('/api/articles');

// 错误处理
try {
  await api.post('/api/categories', { name: 'x' });
} catch (err) {
  if (isApiError(err)) {
    console.log(err.code, err.message, err.details);
  }
}
```

---

## Web Interface Guidelines

### 已符合

- **Loading 状态**：使用 `…` 结尾（"验证中…"、"加载中…"）
- **Placeholder**：以 `…` 结尾（"请输入密码…"）
- **图标按钮**：关键操作有 `aria-label`（如展开/收起、编辑、删除）
- **表单**：`label` + `htmlFor` 关联
- **Focus**：使用 `focus-visible:ring-*`
- **错误展示**：`role="alert"` 用于异步错误
- **装饰图标**：`aria-hidden`

### 待改进（可选）

- **日期格式**：当前用 `date-fns` + locale，规范建议 `Intl.DateTimeFormat`，两者等价
- **prefers-reduced-motion**：动画可增加 `@media (prefers-reduced-motion: reduce)` 降级

---

## Java 后端（api-design）

- 错误响应格式 `{ error: { code, message, details? } }` ✓
- HTTP 状态码语义正确（401/404/422）✓
- REST 资源命名（复数、kebab-case）✓
