export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            欢迎来到我的博客
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            分享技术知识，探索编程世界
          </p>
        </header>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
            最新文章
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-800">
              <time className="text-sm text-gray-500 dark:text-gray-400">
                2024年1月1日
              </time>
              <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
                微服务架构入门指南
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                从单体应用到微服务的演进之路，包含实际案例分析
              </p>
            </article>
            <article className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-800">
              <time className="text-sm text-gray-500 dark:text-gray-400">
                2023年12月15日
              </time>
              <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
                React 性能优化实践
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                深入探讨 React 应用的性能优化技巧和最佳实践
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-lg bg-blue-50 p-8 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-50">
            关于我
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            我是一名全栈开发者，热爱技术分享。这个博客主要用于记录我的学习笔记
            和开发经验，希望能帮助到同样热爱编程的你。
          </p>
        </section>
      </main>
    </div>
  );
}
