# .cursorrules 合规性检测报告

> 检测时间：基于当前代码库快照
> 最近更新：2025-03-12（已修复合规项）

---

## 一、Java / Spring Boot ✅ 基本符合

| 检测项                               | 状态    | 说明                                                                   |
| ------------------------------------ | ------- | ---------------------------------------------------------------------- |
| 包结构 Controller→Service→Repository | ⚠️ 部分 | 使用 `model` 而非 `entity`，功能等价                                   |
| 所有 Public API 有 Swagger 注解      | ✅      | 10 个 Controller 均有 `@Tag`、`@Operation`                             |
| DTO 传输，不暴露 Entity              | ✅      | 使用 ArticleDto、CategoryDto 等                                        |
| 全局异常处理                         | ✅      | `GlobalExceptionHandler` 返回 `{ error: { code, message, details? } }` |
| Controller 无 try-catch 吞异常       | ✅      | 未发现                                                                 |

**建议**：若需严格对齐规范，可将 `model` 包重命名为 `entity`（可选）。

---

## 二、Next.js / React / TypeScript ✅ 已改进

| 检测项                      | 状态 | 说明                                                               |
| --------------------------- | ---- | ------------------------------------------------------------------ |
| Server Components 优先      | ✅   | 首页、文章详情、分类页均为 Server Component，服务端 async 获取数据 |
| 数据获取在 Server Component | ✅   | 在 page.tsx 中 await fetch，通过 props 传给 Client 子组件          |
| TypeScript strict，禁止 any | ✅   | tsconfig `strict: true`，未发现 `any`                              |
| 使用 @blog/api-client       | ✅   | `src/lib/api.ts` 基于 createClient                                 |
| 错误用 isApiError 解析      | ✅   | 页面 catch 后使用 isApiError(err) 展示 err.message                 |
| Client Component 无大段逻辑 | ✅   | toCategoryNodes、findCategoryById 等已抽到 lib/category-utils.ts   |
| next/image                  | N/A  | 当前无图片，后续有图时需遵守                                       |
| Tailwind CSS                | ✅   | 已使用                                                             |

**已实施**：

1. `page.tsx` 改为 Server Component，服务端 async 获取数据，通过 props 传给 HomePageClient、ArticlePageClient、CategoryPageClient
2. `toCategoryNodes`、`findCategoryById`、`getCategoryIdsIncludingChildren` 已抽到 `lib/category-utils.ts`
3. 错误处理使用 `isApiError(err)` 展示 `err.message`

---

## 三、Admin (Vite + React) ✅ 符合

| 检测项               | 状态 | 说明                                      |
| -------------------- | ---- | ----------------------------------------- |
| @blog/api-client     | ✅   | `src/lib/api.ts` 使用 createClient        |
| 图标按钮 aria-label  | ✅   | Categories、Articles、Users、Roles 等均有 |
| 装饰图标 aria-hidden | ✅   | 已使用                                    |

---

## 四、Docker ✅ 符合

| 检测项                 | 状态 | 说明                                                         |
| ---------------------- | ---- | ------------------------------------------------------------ |
| 多阶段构建             | ✅   | Dockerfile.java、Dockerfile.web、Dockerfile.nginx 均为多阶段 |
| --platform=linux/amd64 | ✅   | 所有 FROM 已指定                                             |
| 非 root 用户           | ✅   | Java、Web 使用 appuser/nextjs；Nginx 保持默认（常见做法）    |

---

## 五、Nginx ✅ 符合

| 检测项      | 状态 | 说明                                          |
| ----------- | ---- | --------------------------------------------- |
| Gzip 压缩   | ✅   | 已启用，含 application/json 等                |
| 缓存策略    | ✅   | /admin/、/\_next/static/ 已配置 Cache-Control |
| 代理头      | ✅   | Host、X-Real-IP、X-Forwarded-\* 已设置        |
| 安全 Header | ✅   | X-Content-Type-Options、X-Frame-Options       |

---

## 六、汇总

| 栈      | 符合度 | 主要问题                     |
| ------- | ------ | ---------------------------- |
| Java    | 95%    | 包名 model vs entity（可选） |
| Next.js | 95%    | —                            |
| Admin   | 100%   | —                            |
| Docker  | 100%   | —                            |
| Nginx   | 100%   | —                            |

**当前状态**：Next.js 已按规范完成 Server Components 优先、数据服务端获取、分类工具抽取、isApiError 错误展示等改进。
