import type { Article } from '@blog/types';
import { format } from 'date-fns';
import { parseDateTime } from '@blog/utils';
import { Edit2, Trash2, Plus, FileText, Loader2 } from 'lucide-react';
import { cn } from '@blog/utils';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AdminSelect } from '@/components/AdminSelect';
import type { CategoryFilterOption } from '../categoryUtils';

export function ArticleListView({
  error,
  filterCategoryId,
  setFilterCategoryId,
  categoryFilterOptions,
  filteredArticles,
  deletingId,
  onNewArticle,
  onEdit,
  onDelete,
}: {
  error: string | null;
  filterCategoryId: string | 'all';
  setFilterCategoryId: (id: string | 'all') => void;
  categoryFilterOptions: CategoryFilterOption[];
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label
          htmlFor="article-category-filter"
          className="text-sm font-medium text-zinc-700 shrink-0"
        >
          按分类筛选
        </label>
        <AdminSelect
          id="article-category-filter"
          value={filterCategoryId}
          onChange={(v) => setFilterCategoryId(v === 'all' ? 'all' : String(v))}
          options={[
            { value: 'all', label: '所有文章（含全部子分类）' },
            ...categoryFilterOptions.map((o) => ({ value: o.value, label: o.label })),
          ]}
          showSearch
          optionFilterProp="label"
          placeholder="选择分类"
          className="w-full min-w-0 sm:max-w-xl"
          size="middle"
          aria-label="按分类筛选文章；选中某节点会包含其下所有子分类中的文章"
        />
      </div>
      <p className="text-xs text-zinc-500 -mt-2">
        选项中的「 / 」表示从根到当前节点的路径；选中某一类后，列表包含该类及其子类下的文章。
      </p>

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
