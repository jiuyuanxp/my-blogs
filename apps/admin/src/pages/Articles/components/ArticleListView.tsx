import type { Article, Category } from '@blog/types';
import { format } from 'date-fns';
import { parseDateTime } from '@blog/utils';
import { Edit2, Trash2, Plus, FileText, Loader2 } from 'lucide-react';
import { cn } from '@blog/utils';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AdminSelect } from '@/components/AdminSelect';

export function ArticleListView({
  error,
  rootCategories,
  activeTabId,
  setActiveTabId,
  selectedSubCatId,
  setSelectedSubCatId,
  activeSubCategories,
  filteredArticles,
  deletingId,
  onNewArticle,
  onEdit,
  onDelete,
}: {
  error: string | null;
  rootCategories: Category[];
  activeTabId: string | 'all';
  setActiveTabId: (id: string | 'all') => void;
  selectedSubCatId: string | 'all';
  setSelectedSubCatId: (id: string | 'all') => void;
  activeSubCategories: Category[];
  filteredArticles: Article[];
  deletingId: string | null;
  onNewArticle: () => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900 text-balance">
          文章管理
        </h2>
        <button
          type="button"
          onClick={onNewArticle}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors motion-reduce:transition-none touch-manipulation focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden />
          写文章
        </button>
      </div>

      {error ? <ErrorAlert message={error} /> : null}

      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="文章分类筛选">
          <button
            type="button"
            onClick={() => {
              setActiveTabId('all');
              setSelectedSubCatId('all');
            }}
            className={cn(
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm touch-manipulation transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded',
              activeTabId === 'all'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            )}
          >
            所有文章
          </button>
          {rootCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveTabId(cat.id);
                setSelectedSubCatId('all');
              }}
              className={cn(
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm touch-manipulation transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded',
                activeTabId === cat.id
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              )}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTabId !== 'all' && activeSubCategories.length > 0 ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">筛选子分类：</span>
          <label htmlFor="subcat-select" className="sr-only">
            选择子分类
          </label>
          <AdminSelect
            id="subcat-select"
            value={selectedSubCatId}
            onChange={(v) => setSelectedSubCatId(v === 'all' ? 'all' : String(v))}
            options={[
              {
                value: 'all',
                label: `全部 ${rootCategories.find((c) => c.id === activeTabId)?.name ?? ''}`,
              },
              ...activeSubCategories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            className="min-w-[12rem]"
            size="small"
            aria-label="选择子分类"
          />
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain touch-manipulation">
          <table className="min-w-full divide-y divide-zinc-200">
            <caption className="sr-only">文章列表</caption>
            <thead className="bg-zinc-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  标题
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  分类
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  状态
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  浏览量
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  日期
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  className="hover:bg-zinc-50 transition-colors motion-reduce:transition-none"
                  aria-busy={deletingId === article.id}
                >
                  <td className="px-6 py-4 min-w-0 max-w-xs align-top">
                    <div className="flex items-start gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" aria-hidden />
                      <span className="font-medium text-zinc-900 wrap-break-word">
                        {article.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {article.categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-zinc-100 text-zinc-800'
                      )}
                    >
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 font-mono tabular-nums">
                    {article.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {format(parseDateTime(article.createdAt), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(article)}
                        disabled={deletingId !== null}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors motion-reduce:transition-none touch-manipulation focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none"
                        aria-label={`编辑《${article.title}》`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(article)}
                        disabled={deletingId !== null}
                        aria-busy={deletingId === article.id}
                        aria-label={`删除《${article.title}》`}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors motion-reduce:transition-none touch-manipulation focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center"
                      >
                        {deletingId === article.id ? (
                          <Loader2
                            className="w-4 h-4 animate-spin motion-reduce:animate-none text-red-500"
                            aria-hidden
                          />
                        ) : (
                          <Trash2 className="w-4 h-4" aria-hidden />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    暂无文章
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
