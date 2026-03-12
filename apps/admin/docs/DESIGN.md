# Admin 前端设计说明

博客管理后台前端设计文档。开发时需参考以下规范。

## 参考规范

| 规范                        | 用途                                 | 来源                                                                                |
| --------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Web Interface Guidelines    | 无障碍、表单、动画、焦点、内容处理等 | [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) |
| Vercel React Best Practices | 性能、数据获取、重渲染、Bundle 优化  | 见 AGENTS.md / vercel-react-best-practices                                          |

## 技术栈

- **框架**: React + Vite
- **路由**: React Router
- **样式**: Tailwind CSS
- **数据**: 对接 Java 后端 API（替换 mock）

## 设计决策

### 1. 认证

- 登录页输入管理密码，调用 `POST /api/auth/login`
- Token 存 `localStorage`，请求头带 `Authorization: Bearer <token>`
- 路由守卫：未登录跳转登录页
- Token 失效时清除并跳转登录

### 2. 数据获取

- 使用 SWR 或 React Query 做请求去重、缓存、重试
- 避免瀑布流：独立数据并行请求（`Promise.all`）
- 列表 >50 条考虑虚拟滚动（如 `@tanstack/react-virtual`）

### 3. 表单

- 必填校验、错误信息展示在字段旁
- 提交时按钮禁用，显示加载状态
- 未保存离开前提示（`beforeunload` 或路由守卫）

### 4. 无障碍

- 图标按钮需 `aria-label`
- 表单控件需 `<label>` 或 `aria-label`
- 交互元素需 `focus-visible:ring-*`
- 装饰性图标用 `aria-hidden="true"`

### 5. 移动端

- 不做独立移动端 App，web 做好响应式即可
- 管理后台以桌面为主，小屏保证可用（折叠侧栏、表格横向滚动）

## 页面与 API 映射

| 页面       | 主要 API                                                |
| ---------- | ------------------------------------------------------- |
| Login      | POST /api/auth/login                                    |
| Dashboard  | GET /api/stats/summary, popular-views, popular-comments |
| Articles   | GET/POST/PUT/DELETE /api/articles                       |
| Categories | GET/POST/PUT/DELETE /api/categories                     |
| Comments   | GET /api/comments, DELETE /api/comments/:id             |

## 对接说明

详见 [INTEGRATION.md](./INTEGRATION.md)。API 设计文档在服务端 [services/java/docs/api/](../../services/java/docs/api/README.md)，或通过 Swagger 查看。

## 错误处理

- 401：清除 token，跳转登录
- 4xx：展示 `error.message`，必要时按 `error.code` 分支
- 5xx：通用错误提示，可重试
