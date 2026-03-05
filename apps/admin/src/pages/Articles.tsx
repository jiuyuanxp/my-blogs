import { useState } from 'react';
import type { Article, Category } from '@/types';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, Plus, FileText, Eye, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/lib/mock-data';

export default function Articles() {
  const [articles] = useState<Article[]>(MOCK_ARTICLES);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [activeTabId, setActiveTabId] = useState<number | 'all'>('all');
  const [selectedSubCatId, setSelectedSubCatId] = useState<number | 'all'>(
    'all'
  );
  const [isEditing, setIsEditing] = useState<Article | Partial<Article> | null>(
    null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const rootCategories = categories.filter(c => c.parent_id === null);
  const getSubCategories = (parentId: number): Category[] => {
    const subs = categories.filter(c => c.parent_id === parentId);
    let allSubs = [...subs];
    subs.forEach(s => {
      allSubs = [...allSubs, ...getSubCategories(s.id)];
    });
    return allSubs;
  };
  const activeSubCategories =
    activeTabId !== 'all' ? getSubCategories(activeTabId) : [];

  const filteredArticles =
    activeTabId === 'all' && selectedSubCatId === 'all'
      ? articles
      : articles.filter(a => {
          if (selectedSubCatId !== 'all')
            return a.category_id === selectedSubCatId;
          if (activeTabId !== 'all') {
            const subIds = getSubCategories(activeTabId).map(c => c.id);
            return (
              subIds.includes(a.category_id) || a.category_id === activeTabId
            );
          }
          return true;
        });

  if (isEditing) {
    return (
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
            {isEditing.id ? '编辑文章' : '写文章'}
          </h2>
          <button
            type="button"
            onClick={() => setIsEditing(null)}
            className="text-sm text-zinc-500 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded"
          >
            返回文章列表
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            setIsEditing(null);
          }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="article-title"
              className="text-sm font-medium text-zinc-700"
            >
              标题
            </label>
            <input
              id="article-title"
              required
              value={isEditing.title || ''}
              onChange={e =>
                setIsEditing({ ...isEditing, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              placeholder="输入文章标题…"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="article-category"
                className="text-sm font-medium text-zinc-700"
              >
                分类
              </label>
              <select
                id="article-category"
                required
                value={isEditing.category_id || ''}
                onChange={e =>
                  setIsEditing({
                    ...isEditing,
                    category_id: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <option value="" disabled>
                  选择一个分类
                </option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="article-status"
                className="text-sm font-medium text-zinc-700"
              >
                状态
              </label>
              <select
                id="article-status"
                value={isEditing.status || 'draft'}
                onChange={e =>
                  setIsEditing({
                    ...isEditing,
                    status: e.target.value as 'draft' | 'published',
                  })
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="article-content"
                className="text-sm font-medium text-zinc-700"
              >
                内容 (Markdown)
              </label>
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
                    !isPreviewMode
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  )}
                >
                  <Code className="w-3.5 h-3.5" aria-hidden />
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
                    isPreviewMode
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  )}
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden />
                  预览
                </button>
              </div>
            </div>
            <div className="border border-zinc-300 rounded-lg overflow-hidden min-h-[400px] flex flex-col">
              {!isPreviewMode ? (
                <textarea
                  id="article-content"
                  required
                  value={isEditing.content || ''}
                  onChange={e =>
                    setIsEditing({ ...isEditing, content: e.target.value })
                  }
                  className="w-full flex-1 p-4 focus:outline-none font-mono text-sm resize-y min-h-[400px] focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-inset"
                  placeholder="在此处编写 Markdown 内容…"
                />
              ) : (
                <div className="w-full flex-1 p-6 bg-zinc-50 overflow-auto min-h-[400px]">
                  <div className="prose prose-zinc max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {isEditing.content || '*暂无内容*'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsEditing(null)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              保存文章
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          文章管理
        </h2>
        <button
          type="button"
          onClick={() => setIsEditing({ status: 'draft' })}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden />
          写文章
        </button>
      </div>

      <div className="border-b border-zinc-200">
        <nav
          className="-mb-px flex space-x-6 overflow-x-auto"
          aria-label="文章分类筛选"
        >
          <button
            type="button"
            onClick={() => {
              setActiveTabId('all');
              setSelectedSubCatId('all');
            }}
            className={cn(
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded',
              activeTabId === 'all'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            )}
          >
            所有文章
          </button>
          {rootCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveTabId(cat.id);
                setSelectedSubCatId('all');
              }}
              className={cn(
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 rounded',
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

      {activeTabId !== 'all' && activeSubCategories.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">筛选子分类：</span>
          <label htmlFor="subcat-select" className="sr-only">
            选择子分类
          </label>
          <select
            id="subcat-select"
            value={selectedSubCatId}
            onChange={e =>
              setSelectedSubCatId(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <option value="all">
              全部 {rootCategories.find(c => c.id === activeTabId)?.name}
            </option>
            {activeSubCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  浏览量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {filteredArticles.map(article => (
                <tr
                  key={article.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <FileText
                        className="w-4 h-4 text-zinc-400 shrink-0"
                        aria-hidden
                      />
                      <span className="font-medium text-zinc-900">
                        {article.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {article.category_name}
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
                    {format(parseISO(article.created_at), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(article)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        aria-label={`编辑《${article.title}》`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => window.confirm('确定要删除这篇文章吗？')}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                        aria-label={`删除《${article.title}》`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredArticles.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    暂无文章
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
