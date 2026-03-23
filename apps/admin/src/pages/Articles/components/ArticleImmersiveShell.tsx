import type { Dispatch, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import type { Article, Category } from '@blog/types';
import { Minimize2, Loader2 } from 'lucide-react';
import { cn } from '@blog/utils';
import { MarkdownSplitEditor } from '@/components/MarkdownSplitEditor';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AdminSelect } from '@/components/AdminSelect';

type Editing = Article | Partial<Article>;

export function ArticleImmersiveShell({
  isEditing,
  setIsEditing,
  flatCats,
  error,
  saving,
  onExitImmersive,
  onBackToList,
  onSave,
}: {
  isEditing: Editing;
  setIsEditing: Dispatch<SetStateAction<Article | Partial<Article> | null>>;
  flatCats: Category[];
  error: string | null;
  saving: boolean;
  onExitImmersive: () => void;
  onBackToList: () => void;
  onSave: () => void;
}) {
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-60 flex flex-col bg-[#fafafa] text-zinc-900 shadow-2xl',
        'overscroll-behavior-contain touch-manipulation',
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
        'pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="immersive-editor-title"
    >
      <header className="shrink-0 flex flex-wrap items-center gap-2 gap-y-3 px-4 py-3 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={onExitImmersive}
          disabled={saving}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="退出沉浸写作"
        >
          <Minimize2 className="w-4 h-4 shrink-0" aria-hidden />
          退出沉浸
        </button>
        <span id="immersive-editor-title" className="text-sm font-medium text-zinc-500">
          {isEditing.id ? '编辑文章' : '写文章'}
        </span>
        <input
          id="article-title-immersive"
          name="title"
          autoComplete="off"
          aria-label="文章标题"
          value={isEditing.title || ''}
          onChange={(e) => setIsEditing({ ...isEditing, title: e.target.value })}
          disabled={saving}
          className="flex-1 min-w-40 max-w-xl px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500"
          placeholder="标题…"
        />
        <label htmlFor="article-category-immersive" className="sr-only">
          分类
        </label>
        <AdminSelect
          id="article-category-immersive"
          placeholder="分类"
          value={isEditing.categoryId || undefined}
          onChange={(v) =>
            setIsEditing({
              ...isEditing,
              categoryId: String(v),
            })
          }
          disabled={saving}
          options={flatCats.map((c) => ({ value: c.id, label: c.name }))}
          className="max-w-40"
          getPopupContainer={() => document.body}
          aria-label="分类"
        />
        <label htmlFor="article-status-immersive" className="sr-only">
          状态
        </label>
        <AdminSelect
          id="article-status-immersive"
          value={(isEditing.status || 'draft') as 'draft' | 'published'}
          onChange={(v) =>
            setIsEditing({
              ...isEditing,
              status: v as 'draft' | 'published',
            })
          }
          disabled={saving}
          options={[
            { value: 'draft', label: '草稿' },
            { value: 'published', label: '已发布' },
          ]}
          className="min-w-[6.5rem]"
          getPopupContainer={() => document.body}
          aria-label="状态"
        />
        <button
          type="button"
          onClick={onBackToList}
          disabled={saving}
          className="px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          返回列表
        </button>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          aria-busy={saving}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {saving ? (
            <>
              <Loader2
                className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
              保存中…
            </>
          ) : (
            '保存'
          )}
        </button>
      </header>

      {error ? (
        <ErrorAlert message={error} variant="compact" className="shrink-0 mx-4 mt-3" />
      ) : null}

      <div className="flex-1 flex flex-col min-h-0 px-4 pb-2 pt-3">
        <MarkdownSplitEditor
          fillHeight
          textareaId="article-content-immersive"
          content={isEditing.content || ''}
          onChange={(v) => setIsEditing({ ...isEditing, content: v })}
          className="flex-1 min-h-0"
          disabled={saving}
        />
      </div>
      <p className="shrink-0 text-center text-xs text-zinc-400 py-2 border-t border-zinc-100 bg-white/80">
        左侧预览 · 右侧编辑 · 按 Esc 退出沉浸模式
      </p>
    </div>,
    document.body
  );
}
