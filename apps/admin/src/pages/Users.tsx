import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import {
  fetchUsers,
  fetchRoles,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  type User,
  type Role,
} from '@/lib/api';
import { apiErrorMessage } from '@/lib/errorMessage';
import { ErrorAlert } from '@/components/ErrorAlert';
import { InlineLoading } from '@/components/PageLoading';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSelect } from '@/components/AdminSelect';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState<'create' | 'edit' | 'reset' | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    nickname: '',
    roleId: '',
    status: '',
  });
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const { hasButton } = useAuth();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetchRoles(),
        fetchUsers({ page, pageSize: 20 }),
      ]);
      setRoles(rolesRes);
      setUsers(usersRes.data);
      setTotalPages(usersRes.meta.totalPages);
    } catch (err) {
      setError(apiErrorMessage(err, '加载失败，请刷新页面或稍后重试。'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password || !form.roleId) return;
    setError(null);
    try {
      await createUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname || undefined,
        roleId: form.roleId,
      });
      setForm({ username: '', password: '', nickname: '', roleId: '', status: '' });
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, '创建失败，请稍后重试。'));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    try {
      await updateUser(editingUser.id, {
        nickname: form.nickname || undefined,
        roleId: form.roleId || undefined,
        status: form.status || undefined,
      });
      setEditingUser(null);
      setIsModalOpen(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, '更新失败，请稍后重试。'));
    }
  };

  const handleResetPwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdUser || newPassword.length < 6) return;
    setError(null);
    try {
      await resetUserPassword(resetPwdUser.id, newPassword);
      setResetPwdUser(null);
      setNewPassword('');
      setIsModalOpen(null);
    } catch (err) {
      setError(apiErrorMessage(err, '重置失败，请稍后重试。'));
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`确定要删除用户「${user.username}」吗？`)) return;
    setError(null);
    try {
      await deleteUser(user.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, '删除失败，请稍后重试。'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-zinc-900">用户管理</h1>
        {hasButton('user', 'create') && (
          <button
            type="button"
            onClick={() => {
              setForm({ username: '', password: '', nickname: '', roleId: '', status: '' });
              setIsModalOpen('create');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <Plus className="w-4 h-4" aria-hidden />
            新建用户
          </button>
        )}
      </div>

      {error ? <ErrorAlert message={error} /> : null}

      {loading ? (
        <InlineLoading />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">用户名</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">昵称</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">角色</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">状态</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.nickname || '-'}</td>
                  <td className="px-4 py-3">{u.roleName}</td>
                  <td className="px-4 py-3">{u.status === 'active' ? '正常' : '禁用'}</td>
                  <td className="px-4 py-3 text-right">
                    {hasButton('user', 'edit') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(u);
                          setForm({
                            username: u.username,
                            password: '',
                            nickname: u.nickname ?? '',
                            roleId: u.roleId ?? '',
                            status: u.status,
                          });
                          setIsModalOpen('edit');
                        }}
                        className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        aria-label="编辑"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                    {hasButton('user', 'reset_pwd') && (
                      <button
                        type="button"
                        onClick={() => {
                          setResetPwdUser(u);
                          setNewPassword('');
                          setIsModalOpen('reset');
                        }}
                        className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        aria-label="重置密码"
                      >
                        <Key className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                    {hasButton('user', 'delete') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border border-zinc-200 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span className="py-1 text-zinc-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border border-zinc-200 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">新建用户</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">密码</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">角色</label>
                <AdminSelect
                  block
                  placeholder="请选择"
                  value={form.roleId || undefined}
                  onChange={(v) => setForm((f) => ({ ...f, roleId: String(v) }))}
                  options={roles
                    .filter((r) => r.code !== 'super_admin')
                    .map((r) => ({ value: r.id, label: r.name }))}
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
      {isModalOpen === 'edit' && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">编辑用户</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">角色</label>
                <AdminSelect
                  block
                  value={form.roleId || undefined}
                  onChange={(v) => setForm((f) => ({ ...f, roleId: String(v) }))}
                  options={roles
                    .filter((r) => r.code !== 'super_admin')
                    .map((r) => ({ value: r.id, label: r.name }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">状态</label>
                <AdminSelect
                  block
                  value={form.status || editingUser.status}
                  onChange={(v) => setForm((f) => ({ ...f, status: String(v) }))}
                  options={[
                    { value: 'active', label: '正常' },
                    { value: 'disabled', label: '禁用' },
                  ]}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(null);
                    setEditingUser(null);
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

      {/* Reset Password Modal */}
      {isModalOpen === 'reset' && resetPwdUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">重置密码 - {resetPwdUser.username}</h2>
            <form onSubmit={handleResetPwd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(null);
                    setResetPwdUser(null);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-lg">
                  重置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
