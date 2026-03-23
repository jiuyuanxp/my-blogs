import { useState, useEffect } from 'react';
import type { Category } from '@blog/types';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { apiErrorMessage } from '@/lib/errorMessage';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PageLoading } from '@/components/PageLoading';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState<{
    parentId: string | null;
    parentName?: string;
  } | null>(null);
  const [formName, setFormName] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(apiErrorMessage(err, '加载失败，请刷新页面或稍后重试。'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setError(null);
    try {
      if (isEditing) {
        await updateCategory(isEditing.id, formName, isEditing.parentId);
      } else if (isAdding) {
        await createCategory(formName, isAdding.parentId);
      }
      setFormName('');
      setIsEditing(null);
      setIsAdding(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, '保存失败，请稍后重试。'));
    }
  };

  const handleDelete = async (node: Category) => {
    if (!window.confirm(`确定要删除分类「${node.name}」吗？`)) return;
    setError(null);
    try {
      await deleteCategory(node.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, '删除失败，请稍后重试。'));
    }
  };

  const renderTree = (nodes: Category[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expanded.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.id} className="w-full">
          <div
            className="flex items-center justify-between py-2 px-3 hover:bg-zinc-50 rounded-lg group"
            style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="p-1 hover:bg-zinc-200 rounded text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                aria-label={isExpanded ? '收起' : '展开'}
                aria-expanded={isExpanded}
                style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" aria-hidden />
                ) : (
                  <ChevronRight className="w-4 h-4" aria-hidden />
                )}
              </button>

              {isEditing?.id === node.id ? (
                <div className="flex items-center gap-2">
                  <label htmlFor="edit-cat-name" className="sr-only">
                    分类名称
                  </label>
                  <input
                    id="edit-cat-name"
                    autoFocus
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="px-2 py-1 border border-zinc-300 rounded text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    className="text-xs bg-zinc-900 text-white px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(null)}
                    className="text-xs bg-zinc-200 px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span className="font-medium text-zinc-700">{node.name}</span>
              )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAdding({ parentId: node.id, parentName: node.name });
                  setFormName('');
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    next.add(node.id);
                    return next;
                  });
                }}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                title="添加子分类"
                aria-label={`在「${node.name}」下添加子分类`}
              >
                <Plus className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(node);
                  setFormName(node.name);
                }}
                className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                title="编辑"
                aria-label={`编辑分类「${node.name}」`}
              >
                <Edit2 className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(node)}
                className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                title="删除"
                aria-label={`删除分类「${node.name}」`}
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          {isExpanded && hasChildren && <div>{renderTree(node.children!, level + 1)}</div>}
        </div>
      );
    });
  };

  if (loading) {
    return <PageLoading title="分类管理" />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">分类管理</h2>
        <button
          type="button"
          onClick={() => {
            setIsAdding({ parentId: null });
            setFormName('');
          }}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden />
          添加根分类
        </button>
      </div>

      {error ? <ErrorAlert message={error} /> : null}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
        {isAdding != null && (
          <div className="p-3 mb-2 bg-zinc-50 rounded-lg border border-zinc-200 space-y-2">
            {isAdding.parentId != null && isAdding.parentName ? (
              <p className="text-sm text-zinc-600">在「{isAdding.parentName}」下添加子分类</p>
            ) : null}
            <div className="flex items-center gap-2">
              <label htmlFor="new-cat-name" className="sr-only">
                新分类名称
              </label>
              <input
                id="new-cat-name"
                autoFocus
                placeholder="新分类名称…"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="px-3 py-1.5 border border-zinc-300 rounded-md text-sm flex-1 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSave}
                className="text-sm bg-zinc-900 text-white px-3 py-1.5 rounded-md font-medium focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(null)}
                className="text-sm bg-zinc-200 px-3 py-1.5 rounded-md font-medium focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {categories.length > 0 ? (
          <div className="space-y-1">{renderTree(categories)}</div>
        ) : (
          <div className="text-center py-8 text-zinc-500">暂无分类，请先创建一个分类。</div>
        )}
      </div>
    </div>
  );
}
