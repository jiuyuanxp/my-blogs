import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  fetchPermissions,
  createPermission as apiCreatePermission,
  updatePermission as apiUpdatePermission,
  deletePermission as apiDeletePermission,
  isApiError,
  type Permission,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<'create' | 'edit' | null>(null);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'menu' as 'menu' | 'button',
    parentId: '',
    sortOrder: 0,
  });
  const { hasButton } = useAuth();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPermissions();
      setPermissions(list);
    } catch (err) {
      setError(isApiError(err) ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setError(null);
    try {
      await apiCreatePermission({
        code: form.code,
        name: form.name,
        type: form.type,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        sortOrder: form.sortOrder,
      });
      setForm({ code: '', name: '', type: 'menu', parentId: '', sortOrder: 0 });
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '创建失败');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerm) return;
    setError(null);
    try {
      await apiUpdatePermission(editingPerm.id, {
        name: form.name,
        type: form.type,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        sortOrder: form.sortOrder,
      });
      setEditingPerm(null);
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '更新失败');
    }
  };

  const handleDelete = async (p: Permission) => {
    if (!window.confirm(`确定要删除权限「${p.name}」吗？`)) return;
    setError(null);
    try {
      await apiDeletePermission(p.id);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-zinc-900">权限管理</h1>
        {hasButton('permission', 'create') && (
          <button
            type="button"
            onClick={() => {
              setForm({ code: '', name: '', type: 'menu', parentId: '', sortOrder: 0 });
              setIsModalOpen('create');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4" aria-hidden />
            新建权限
          </button>
        )}
      </div>

      {error && (
        <div
          className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">加载中…</p>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">编码</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">名称</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">类型</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">排序</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.type === 'menu' ? '菜单' : '按钮'}</td>
                  <td className="px-4 py-3">{p.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    {hasButton('permission', 'edit') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPerm(p);
                          setForm({
                            code: p.code,
                            name: p.name,
                            type: p.type,
                            parentId: p.parentId ?? '',
                            sortOrder: p.sortOrder,
                          });
                          setIsModalOpen('edit');
                        }}
                        className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        aria-label="编辑"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                    {hasButton('permission', 'delete') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="删除"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal - need to add createPermission/updatePermission/deletePermission to api.ts */}
      {isModalOpen === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">新建权限</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">编码</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="menu:xxx 或 btn:xxx:action"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">类型</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as 'menu' | 'button' }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                >
                  <option value="menu">菜单</option>
                  <option value="button">按钮</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">排序</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-lg">
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen === 'edit' && editingPerm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">编辑权限</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">编码</label>
                <input
                  type="text"
                  value={editingPerm.code}
                  disabled
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">类型</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as 'menu' | 'button' }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                >
                  <option value="menu">菜单</option>
                  <option value="button">按钮</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">排序</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(null);
                    setEditingPerm(null);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-lg">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
