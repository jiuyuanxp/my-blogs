import { Palette, Type, Layout } from 'lucide-react';

export default function DesignSystem() {
  return (
    <div className="space-y-12 max-w-5xl pb-12">
      <div className="border-b border-zinc-200 pb-6">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          设计规范
        </h2>
        <p className="mt-4 text-lg text-zinc-500 max-w-2xl">
          博客管理采用极简、优雅的设计语言，强调内容优先与深浅色的强烈对比。
        </p>
      </div>

      <section className="space-y-6" aria-labelledby="colors-heading">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
          <Palette className="w-5 h-5 text-zinc-400" aria-hidden />
          <h3
            id="colors-heading"
            className="text-xl font-semibold text-zinc-800"
          >
            色彩系统 (Colors)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div
              className="h-24 rounded-2xl bg-[#0a0a0a] shadow-sm border border-zinc-200"
              role="img"
              aria-label="纯黑 #0a0a0a"
            />
            <div className="text-sm font-medium">纯黑 (Pure Dark)</div>
            <div className="text-xs text-zinc-500 font-mono">#0a0a0a</div>
          </div>
          <div className="space-y-2">
            <div
              className="h-24 rounded-2xl bg-[#fcfcfc] shadow-sm border border-zinc-200"
              role="img"
              aria-label="暖白 #fcfcfc"
            />
            <div className="text-sm font-medium">暖白 (Warm White)</div>
            <div className="text-xs text-zinc-500 font-mono">#fcfcfc</div>
          </div>
          <div className="space-y-2">
            <div
              className="h-24 rounded-2xl bg-zinc-500 shadow-sm border border-zinc-200"
              role="img"
              aria-label="中性灰 zinc-500"
            />
            <div className="text-sm font-medium">中性灰 (Zinc 500)</div>
            <div className="text-xs text-zinc-500 font-mono">#71717a</div>
          </div>
          <div className="space-y-2">
            <div
              className="h-24 rounded-2xl bg-blue-600 shadow-sm border border-zinc-200"
              role="img"
              aria-label="强调蓝 blue-600"
            />
            <div className="text-sm font-medium">强调蓝 (Accent Blue)</div>
            <div className="text-xs text-zinc-500 font-mono">#2563eb</div>
          </div>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="typography-heading">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
          <Type className="w-5 h-5 text-zinc-400" aria-hidden />
          <h3
            id="typography-heading"
            className="text-xl font-semibold text-zinc-800"
          >
            排版 (Typography)
          </h3>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-8">
          <div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
              Display / Serif
            </div>
            <h1 className="text-5xl font-serif font-bold text-zinc-900 text-balance">
              Playfair Display
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              用于大标题、品牌名称，传递优雅与高级感。
            </p>
          </div>
          <div className="pt-6 border-t border-zinc-100">
            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
              Body / Sans-serif
            </div>
            <p className="text-xl font-sans text-zinc-900">
              Inter (Regular, Medium, Semibold)
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              用于正文、UI 组件，保证极佳的阅读体验和现代感。
            </p>
          </div>
          <div className="pt-6 border-t border-zinc-100">
            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
              Data / Monospace
            </div>
            <p className="text-lg font-mono text-zinc-700">JetBrains Mono</p>
            <p className="mt-2 text-sm text-zinc-500">
              用于代码块、数字统计、日期显示。
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="components-heading">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-2">
          <Layout className="w-5 h-5 text-zinc-400" aria-hidden />
          <h3
            id="components-heading"
            className="text-xl font-semibold text-zinc-800"
          >
            组件风格 (Components)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              卡片 (Cards)
            </h4>
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
              <p className="font-medium text-zinc-900">标准卡片</p>
              <p className="text-sm text-zinc-500 mt-1">
                使用 rounded-2xl 和 shadow-sm，边框为 zinc-200。
              </p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              按钮 (Buttons)
            </h4>
            <div className="space-y-4">
              <button
                type="button"
                className="w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                主要按钮 (Primary)
              </button>
              <button
                type="button"
                className="w-full bg-white text-zinc-900 border border-zinc-200 px-4 py-2.5 rounded-xl font-medium hover:bg-zinc-50 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                次要按钮 (Secondary)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
