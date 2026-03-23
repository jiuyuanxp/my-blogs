import { useState, useEffect } from 'react';
import type { Comment, Category } from '@blog/types';
import { format } from 'date-fns';
import { parseDateTime } from '@blog/utils';
import { Trash2, MessageSquare } from 'lucide-react';
import { fetchComments, fetchCategories, deleteComment } from '@/lib/api';
import { apiErrorMessage } from '@/lib/errorMessage';
import { flattenCategories } from '@/lib/categoryFlat';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PageLoading } from '@/components/PageLoading';
import { AdminSelect } from '@/components/AdminSelect';

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | 'all'>('all');

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
      setError(apiErrorMessage(err, '加载失败，请刷新页面或稍后重试。'));
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
      setError(apiErrorMessage(err, '删除失败，请稍后重试。'));
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="max-w-5xl">
        <PageLoading title="评论管理" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">评论管理</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="comment-cat-filter" className="text-sm text-zinc-500">
            筛选分类：
          </label>
          <AdminSelect
            id="comment-cat-filter"
            value={selectedCatId}
            onChange={(v) => setSelectedCatId(v === 'all' ? 'all' : String(v))}
            options={[
              { value: 'all', label: '所有分类' },
              ...flatCats.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            className="min-w-[11rem]"
            size="small"
            aria-label="按分类筛选评论"
          />
        </div>
      </div>

      {error ? <ErrorAlert message={error} /> : null}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-200">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-zinc-50 transition-colors">
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
                          {format(parseDateTime(comment.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-zinc-700 text-sm mb-3 break-words">{comment.content}</p>
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
