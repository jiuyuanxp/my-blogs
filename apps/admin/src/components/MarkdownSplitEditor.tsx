import { lazy, Suspense, useDeferredValue } from 'react';
import { cn } from '@blog/utils';

const ArticleMarkdownPreview = lazy(async () => import('./ArticleMarkdownPreview'));

export function MarkdownSplitEditor({
  content,
  onChange,
  className,
  fillHeight = false,
  textareaId = 'article-content',
  disabled = false,
}: {
  content: string;
  onChange: (value: string) => void;
  className?: string;
  fillHeight?: boolean;
  textareaId?: string;
  /** 提交保存中时禁用编辑，避免与请求竞态 */
  disabled?: boolean;
}) {
  const deferredContent = useDeferredValue(content);
  const previewStale = content !== deferredContent;

  const previewPane = (
    <div
      className={cn(
        'order-2 lg:order-1 overflow-auto p-6 bg-zinc-50',
        'border-t lg:border-t-0 lg:border-r border-zinc-200',
        fillHeight ? 'min-h-0 flex-1 lg:min-w-0' : 'min-h-[240px] lg:min-h-0',
        'overscroll-behavior-contain touch-manipulation'
      )}
      aria-live="polite"
      aria-label="Markdown 预览"
      aria-busy={previewStale}
    >
      <div
        className={cn(
          'prose prose-zinc max-w-none prose-pre:bg-zinc-900 prose-pre:text-zinc-100',
          'motion-reduce:transition-none transition-opacity duration-150',
          previewStale && 'opacity-60'
        )}
      >
        <Suspense
          fallback={
            <p className="text-sm text-zinc-400" role="status">
              预览加载中…
            </p>
          }
        >
          <ArticleMarkdownPreview content={deferredContent} />
        </Suspense>
      </div>
    </div>
  );

  const editorPane = (
    <div
      className={cn(
        'order-1 lg:order-2 flex flex-col bg-white',
        fillHeight ? 'min-h-0 flex-1 lg:min-w-0' : 'min-h-[240px] lg:min-h-0'
      )}
    >
      <label htmlFor={textareaId} className="sr-only">
        内容（Markdown）
      </label>
      <textarea
        id={textareaId}
        name={textareaId}
        required
        value={content}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        disabled={disabled}
        className={cn(
          'w-full flex-1 min-h-0 p-4 touch-manipulation',
          !fillHeight && 'min-h-[240px] lg:min-h-0',
          'focus:outline-none font-mono text-sm resize-none',
          'focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-inset',
          'disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed'
        )}
        placeholder="在此处编写 Markdown…"
        spellCheck={false}
      />
    </div>
  );

  if (fillHeight) {
    return (
      <div
        className={cn(
          'flex flex-col lg:flex-row flex-1 min-h-0 border border-zinc-300 rounded-lg overflow-hidden bg-white',
          className
        )}
      >
        {previewPane}
        {editorPane}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 min-h-[420px] lg:min-h-[480px]',
        'border border-zinc-300 rounded-lg overflow-hidden bg-white',
        className
      )}
    >
      {previewPane}
      {editorPane}
    </div>
  );
}
