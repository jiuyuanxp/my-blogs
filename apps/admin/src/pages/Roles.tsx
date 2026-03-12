import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignRolePermissions,
  fetchRole,
  isApiError,
  type Role,
  type Permission,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<'create' | 'edit' | 'assign' | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [assigningRole, setAssigningRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());
  const { hasButton } = useAuth();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([fetchRoles(), fetchPermissions()]);
      setRoles(rolesRes);
      setPermissions(permsRes);
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
      await createRole({ code: form.code, name: form.name, description: form.description });
      setForm({ code: '', name: '', description: '' });
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '创建失败');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setError(null);
    try {
      await updateRole(editingRole.id, { name: form.name, description: form.description });
      setEditingRole(null);
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '更新失败');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRole) return;
    setError(null);
    try {
      await assignRolePermissions(assigningRole.id, Array.from(selectedPermIds));
      setAssigningRole(null);
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '分配失败');
    }
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`确定要删除角色「${role.name}」吗？`)) return;
    setError(null);
    try {
      await deleteRole(role.id);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '删除失败');
    }
  };

  const openAssign = async (role: Role) => {
    const detail = await fetchRole(role.id);
    setAssigningRole(role);
    setSelectedPermIds(new Set((detail.permissionIds ?? []).map(String)));
    setIsModalOpen('assign');
  };

  const togglePerm = (id: string) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-zinc-900">角色管理</h1>
        {hasButton('role', 'create') && (
          <button
            type="button"
            onClick={() => {
              setForm({ code: '', name: '', description: '' });
              setIsModalOpen('create');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4" aria-hidden />
            新建角色
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
                <th className="text-left px-4 py-3 font-medium text-zinc-700">描述</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3">{r.code}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {hasButton('role', 'assign') && r.code !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => openAssign(r)}
                        className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        aria-label="分配权限"
                      >
                        <Key className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                    {hasButton('role', 'edit') && r.code !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRole(r);
                          setForm({ code: r.code, name: r.name, description: r.description ?? '' });
                          setIsModalOpen('edit');
                        }}
                        className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        aria-label="编辑"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                    {hasButton('role', 'delete') && r.code !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
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

      {/* Create Modal */}
      {isModalOpen === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">新建角色</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">编码</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
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
                <label className="block text-sm font-medium text-zinc-700 mb-1">描述</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
      {isModalOpen === 'edit' && editingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">编辑角色</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">编码</label>
                <input
                  type="text"
                  value={editingRole.code}
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
                <label className="block text-sm font-medium text-zinc-700 mb-1">描述</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(null);
                    setEditingRole(null);
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

      {/* Assign Permissions Modal */}
      {isModalOpen === 'assign' && assigningRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">分配权限 - {assigningRole.name}</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {permissions.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermIds.has(p.id)}
                      onChange={() => togglePerm(p.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      [{p.type}] {p.name} ({p.code})
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(null);
                    setAssigningRole(null);
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
