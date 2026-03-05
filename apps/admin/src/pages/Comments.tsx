import { useState } from 'react';
import type { Comment, Category } from '@/types';
import { format, parseISO } from 'date-fns';
import { Trash2, MessageSquare } from 'lucide-react';
import { MOCK_COMMENTS, MOCK_CATEGORIES } from '@/lib/mock-data';

export default function Comments() {
  const [comments] = useState<Comment[]>(MOCK_COMMENTS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');

  // 静态演示：按分类筛选需文章-分类关联，此处暂展示全部
  const filteredComments = comments;

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
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900"
            aria-label="按分类筛选评论"
          >
            <option value="all">所有分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-200">
          {filteredComments.length > 0 ? (
            filteredComments.map(comment => (
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
                          匿名用户
                        </span>
                        <span className="text-zinc-400 text-xs" aria-hidden>
                          •
                        </span>
                        <span className="text-zinc-500 text-sm">
                          {format(
                            parseISO(comment.created_at),
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
                          {comment.article_title}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.confirm('确定要删除这条评论吗？')}
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
