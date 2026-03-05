import { useState } from 'react';
import type { Category } from '@/types';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/lib/mock-data';

export default function Categories() {
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState<{ parentId: number | null } | null>(
    null
  );
  const [formName, setFormName] = useState('');

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const buildTree = (
    items: Category[],
    parentId: number | null = null
  ): Category[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    setFormName('');
    setIsEditing(null);
    setIsAdding(null);
  };

  const tree = buildTree(categories);

  const renderTree = (nodes: Category[], level = 0) => {
    return nodes.map(node => {
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
                    onChange={e => setFormName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
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
                  setIsAdding({ parentId: node.id });
                  setFormName('');
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
                onClick={() => window.confirm('确定要删除这个分类吗？')}
                className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                title="删除"
                aria-label={`删除分类「${node.name}」`}
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          {isExpanded && hasChildren && (
            <div>{renderTree(node.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">
          分类管理
        </h2>
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

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
        {isAdding?.parentId === null && (
          <div className="flex items-center gap-2 p-3 mb-2 bg-zinc-50 rounded-lg border border-zinc-200">
            <label htmlFor="new-cat-name" className="sr-only">
              新分类名称
            </label>
            <input
              id="new-cat-name"
              autoFocus
              placeholder="新分类名称…"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
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
        )}

        {tree.length > 0 ? (
          <div className="space-y-1">{renderTree(tree)}</div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            暂无分类，请先创建一个分类。
          </div>
        )}
      </div>
    </div>
  );
}
