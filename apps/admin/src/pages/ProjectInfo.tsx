import { LayoutTemplate, Sparkles, MonitorSmartphone } from 'lucide-react';

export default function ProjectInfo() {
  return (
    <div className="space-y-12 max-w-5xl pb-12">
      <div className="border-b border-zinc-200 pb-6">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          项目说明
        </h2>
        <p className="mt-4 text-lg text-zinc-500 max-w-2xl">
          博客管理前端专注于极简、高效的内容创作体验，采用现代化的 Web
          技术栈与精致的 UI/UX 设计。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <LayoutTemplate className="w-6 h-6" aria-hidden />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900">前端技术栈</h3>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <strong>React 19</strong> - 构建高性能的单页应用 (SPA)
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <strong>Tailwind CSS v4</strong> - 实用优先的原子化 CSS 框架
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <strong>Lucide React</strong> - 统一、清晰的矢量图标库
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <strong>Recharts</strong> - 优雅的数据可视化图表
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <strong>React Markdown</strong> - 支持 GFM 的 Markdown 实时渲染
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <MonitorSmartphone className="w-6 h-6" aria-hidden />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900">交互与体验</h3>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <strong>响应式设计</strong> - 完美适配桌面端与移动端
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <strong>沉浸式编辑</strong> - 分栏式 Markdown 实时预览
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <strong>微交互动画</strong> - 细腻的 Hover 状态与过渡效果
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <strong>状态反馈</strong> - 清晰的加载状态与错误提示
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
          <Sparkles className="w-5 h-5 text-zinc-400" aria-hidden />
          <h3 className="text-xl font-semibold text-zinc-800">核心设计理念</h3>
        </div>
        <div className="prose prose-zinc max-w-none text-zinc-600">
          <p>在构建博客管理时，我们遵循了以下前端设计原则：</p>
          <ul className="space-y-2">
            <li>
              <strong>内容优先 (Content-First)：</strong>
              摒弃繁杂的装饰，使用大面积的留白和清晰的排版，让用户的注意力集中在数据和内容本身。
            </li>
            <li>
              <strong>优雅的排版 (Typography)：</strong>
              引入 Playfair Display 衬线字体用于大标题和品牌展示，配合 Inter
              无衬线字体，在现代感中注入古典与高级感。
            </li>
            <li>
              <strong>深浅对比 (Contrast)：</strong>
              侧边栏和登录页采用纯黑 (#0a0a0a) 与暖白 (#fcfcfc)
              的强烈对比，打破传统后台管理系统沉闷的灰色调。
            </li>
            <li>
              <strong>圆润与亲和力 (Softness)：</strong>
              全局采用 rounded-2xl
              的大圆角设计，配合柔和的阴影，使界面更加平易近人。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
