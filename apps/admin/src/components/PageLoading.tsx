import { cn } from '@blog/utils';

export function PageLoading({ title, className }: { title: string; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900 text-balance">
        {title}
      </h2>
      <p className="text-zinc-500" role="status">
        加载中…
      </p>
    </div>
  );
}

/** 页面内局部加载（保留标题/工具栏时仅用一行状态） */
export function InlineLoading({ children = '加载中…' }: { children?: string }) {
  return (
    <p className="text-zinc-500" role="status">
      {children}
    </p>
  );
}
