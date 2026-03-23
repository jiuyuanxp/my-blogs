import type { Dispatch, SetStateAction } from 'react';
import type { Article, Category } from '@blog/types';
import { Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@blog/utils';
import { MarkdownSplitEditor } from '@/components/MarkdownSplitEditor';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AdminSelect } from '@/components/AdminSelect';

type Editing = Article | Partial<Article>;

export function ArticleEditorForm({
  isEditing,
  setIsEditing,
  flatCats,
  error,
  saving,
  isImmersive,
  onEnterImmersive,
  onBackToList,
  onSave,
}: {
  isEditing: Editing;
  setIsEditing: Dispatch<SetStateAction<Article | Partial<Article> | null>>;
  flatCats: Category[];
  error: string | null;
  saving: boolean;
  isImmersive: boolean;
  onEnterImmersive: () => void;
  onBackToList: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className={cn(
        'max-w-6xl space-y-6',
        isImmersive && 'pointer-events-none select-none opacity-0'
      )}
      aria-hidden={isImmersive}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900 text-balance">
          {isEditing.id ? '编辑文章' : '写文章'}
        </h2>
        <button
          type="button"
          onClick={onBackToList}
          disabled={saving}
          className="text-sm text-zinc-500 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded disabled:opacity-50 disabled:pointer-events-none"
        >
          返回文章列表
        </button>
      </div>

      {error ? <ErrorAlert message={error} /> : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSave();
        }}
        className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <label htmlFor="article-title" className="text-sm font-medium text-zinc-700">
            标题
          </label>
          <input
            id="article-title"
            name="title"
            type="text"
            autoComplete="off"
            required
            value={isEditing.title || ''}
            onChange={(e) => setIsEditing({ ...isEditing, title: e.target.value })}
            disabled={saving}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500"
            placeholder="输入文章标题…"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="article-category" className="text-sm font-medium text-zinc-700">
              分类
            </label>
            <AdminSelect
              block
              id="article-category"
              placeholder="选择一个分类"
              value={isEditing.categoryId || undefined}
              onChange={(v) =>
                setIsEditing({
                  ...isEditing,
                  categoryId: String(v),
                })
              }
              disabled={saving}
              options={flatCats.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="article-status" className="text-sm font-medium text-zinc-700">
              状态
            </label>
            <AdminSelect
              block
              id="article-status"
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
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-sm font-medium text-zinc-700">内容 (Markdown)</span>
              <p className="text-xs text-zinc-500 mt-0.5 hidden lg:block">
                左侧实时预览，右侧编辑；小屏先编辑、下方预览
              </p>
            </div>
            <button
              type="button"
              onClick={onEnterImmersive}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="进入沉浸写作全屏"
            >
              <Maximize2 className="w-4 h-4 shrink-0" aria-hidden />
              沉浸写作
            </button>
          </div>
          <MarkdownSplitEditor
            content={isEditing.content || ''}
            onChange={(v) => setIsEditing({ ...isEditing, content: v })}
            disabled={saving}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={onBackToList}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none"
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
              '保存文章'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
