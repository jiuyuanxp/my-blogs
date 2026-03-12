import { useState, useEffect } from 'react';
import type { Comment, Category } from '@/types';
import { format, parseISO } from 'date-fns';
import { Trash2, MessageSquare } from 'lucide-react';
import {
  fetchComments,
  fetchCategories,
  deleteComment,
  isApiError,
} from '@/lib/api';

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | 'all'>('all');

  function flattenCategories(cats: Category[]): Category[] {
    const result: Category[] = [];
    for (const c of cats) {
      result.push({ ...c, children: undefined });
      if (c.children?.length) {
        result.push(...flattenCategories(c.children));
      }
    }
    return result;
  }

  const flatCats = flattenCategories(categories);

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch {
      // ignore
    }
  };

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const comRes = await fetchComments({
        categoryId: selectedCatId === 'all' ? undefined : selectedCatId,
      });
      setComments(comRes.data);
    } catch (err) {
      setError(isApiError(err) || err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadComments();
  }, [selectedCatId]);

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;
    setError(null);
    try {
      await deleteComment(comment.id);
      await loadComments();
    } catch (err) {
      setError(isApiError(err) || err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          评论管理
        </h2>
        <p className="text-zinc-500">加载中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          评论管理
        </h2>
        <div className="flex items-center gap-3">
          <label htmlFor="comment-cat-filter" className="text-sm text-zinc-500">
            筛选分类：
          </label>
          <select
            id="comment-cat-filter"
            value={selectedCatId}
            onChange={e =>
              setSelectedCatId(
                e.target.value === 'all' ? 'all' : e.target.value
              )
            }
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900"
            aria-label="按分类筛选评论"
          >
            <option value="all">所有分类</option>
            {flatCats.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-200">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div
                key={comment.id}
                className="p-6 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <div className="mt-1 bg-zinc-100 p-2 rounded-full text-zinc-500 shrink-0">
                      <MessageSquare className="w-4 h-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-zinc-900 text-sm">
                          {comment.authorName}
                        </span>
                        <span className="text-zinc-400 text-xs" aria-hidden>
                          •
                        </span>
                        <span className="text-zinc-500 text-sm">
                          {format(
                            parseISO(comment.createdAt),
                            'yyyy-MM-dd HH:mm'
                          )}
                        </span>
                      </div>
                      <p className="text-zinc-700 text-sm mb-3 break-words">
                        {comment.content}
                      </p>
                      <div className="text-xs text-zinc-500 bg-zinc-100 inline-flex px-2 py-1 rounded max-w-full">
                        来自文章：
                        <span className="font-medium text-zinc-700 ml-1 truncate">
                          {comment.articleTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(comment)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                    title="删除评论"
                    aria-label={`删除评论：${comment.content.slice(0, 20)}…`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-zinc-500">暂无评论</div>
          )}
        </div>
      </div>
    </div>
  );
}
