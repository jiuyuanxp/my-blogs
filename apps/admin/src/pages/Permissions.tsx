import { useState, useEffect, useMemo } from 'react';
import {
  fetchPermissions,
  createPermission as apiCreatePermission,
  updatePermission as apiUpdatePermission,
  deletePermission as apiDeletePermission,
  isApiError,
  type Permission,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionTree } from '@/components/PermissionTree';

/** 从树中提取所有菜单（用于父级选择） */
function collectMenus(tree: Permission[]): Permission[] {
  const result: Permission[] = [];
  function walk(nodes: Permission[]) {
    for (const p of nodes) {
      if (p.type === 'menu') result.push(p);
      if (p.children?.length) walk(p.children);
    }
  }
  walk(tree);
  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}

const INIT_FORM = {
  code: '',
  name: '',
  type: 'menu' as 'menu' | 'button',
  parentId: '',
  routePath: '',
  component: '',
  isHidden: false,
  sortOrder: 0,
};

type FormMode = 'addRoot' | 'addChild' | 'edit' | null;

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Permission | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [form, setForm] = useState(INIT_FORM);
  const { hasButton } = useAuth();

  const menuOptions = useMemo(() => collectMenus(permissions), [permissions]);
  const canEdit = formMode === 'edit' || formMode === 'addRoot' || formMode === 'addChild';

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

  const handleAddRoot = () => {
    setFormMode('addRoot');
    setSelectedNode(null);
    setForm({ ...INIT_FORM, parentId: '' });
  };

  const handleAddChild = (parent: Permission) => {
    setFormMode('addChild');
    setSelectedNode(parent);
    setForm({
      ...INIT_FORM,
      parentId: parent.id,
      type: parent.type === 'menu' ? 'button' : 'menu',
    });
  };

  const handleSelect = (node: Permission | null) => {
    if (node) {
      setFormMode('edit');
      setSelectedNode(node);
      setForm({
        code: node.code,
        name: node.name,
        type: node.type,
        parentId: node.parentId ?? '',
        routePath: node.routePath ?? '',
        component: node.component ?? '',
        isHidden: node.isHidden ?? false,
        sortOrder: node.sortOrder,
      });
    } else {
      setFormMode(null);
      setSelectedNode(null);
      setForm(INIT_FORM);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setError(null);
    try {
      if (formMode === 'edit' && selectedNode) {
        await apiUpdatePermission(selectedNode.id, {
          name: form.name,
          type: form.type,
          parentId: form.parentId ? Number(form.parentId) : undefined,
          routePath: form.routePath || undefined,
          component: form.component || undefined,
          isHidden: form.isHidden,
          sortOrder: form.sortOrder,
        });
      } else {
        await apiCreatePermission({
          code: form.code,
          name: form.name,
          type: form.type,
          parentId: form.parentId ? Number(form.parentId) : undefined,
          routePath: form.routePath || undefined,
          component: form.component || undefined,
          isHidden: form.isHidden,
          sortOrder: form.sortOrder,
        });
      }
      setFormMode(null);
      setSelectedNode(null);
      setForm(INIT_FORM);
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : formMode === 'edit' ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (node: Permission) => {
    const msg = node.children?.length
      ? `确定要删除权限「${node.name}」及其下所有子权限吗？`
      : `确定要删除权限「${node.name}」吗？`;
    if (!window.confirm(msg)) return;
    setError(null);
    try {
      await apiDeletePermission(node.id);
      if (selectedNode?.id === node.id) {
        setFormMode(null);
        setSelectedNode(null);
        setForm(INIT_FORM);
      }
      await load();
    } catch (err) {
      setError(isApiError(err) ? err.message : '删除失败');
    }
  };

  const cancelForm = () => {
    setFormMode(null);
    setSelectedNode(null);
    setForm(INIT_FORM);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif font-bold text-zinc-900">权限管理</h1>

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
        <div className="flex gap-6 min-h-[480px]">
          {/* 左侧树 */}
          <div className="w-80 shrink-0 flex flex-col border border-zinc-200 rounded-xl bg-white p-4">
            <PermissionTree
              data={permissions}
              selectedId={selectedNode?.id ?? null}
              onSelect={handleSelect}
              onAddRoot={hasButton('permission', 'create') ? handleAddRoot : undefined}
              onAddChild={hasButton('permission', 'create') ? handleAddChild : undefined}
              onDelete={hasButton('permission', 'delete') ? handleDelete : undefined}
              canAdd={!!hasButton('permission', 'create')}
              canDelete={!!hasButton('permission', 'delete')}
            />
          </div>

          {/* 右侧表单 */}
          <div
            className={`flex-1 border border-zinc-200 rounded-xl bg-white p-6 transition-opacity ${
              canEdit ? 'opacity-100' : 'opacity-50 pointer-events-none'
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">
              {formMode === 'addRoot' && '新建根节点'}
              {formMode === 'addChild' && `在「${selectedNode?.name}」下添加子节点`}
              {formMode === 'edit' && '编辑权限'}
              {!canEdit && '请选择左侧节点进行编辑，或点击「添加根节点」新建'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="perm-code" className="block text-sm font-medium text-zinc-700 mb-1">
                  编码
                </label>
                <input
                  id="perm-code"
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="menu:xxx 或 btn:xxx:action"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                  disabled={formMode === 'edit'}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="perm-name" className="block text-sm font-medium text-zinc-700 mb-1">
                  名称
                </label>
                <input
                  id="perm-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="perm-type" className="block text-sm font-medium text-zinc-700 mb-1">
                  类型
                </label>
                <select
                  id="perm-type"
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
                <label
                  htmlFor="perm-parent"
                  className="block text-sm font-medium text-zinc-700 mb-1"
                >
                  上级{form.type === 'button' ? '菜单' : '权限'}
                </label>
                <select
                  id="perm-parent"
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                >
                  <option value="">无（根节点）</option>
                  {menuOptions
                    .filter((m) => formMode !== 'edit' || m.id !== selectedNode?.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                </select>
              </div>
              {form.type === 'menu' && (
                <>
                  <div>
                    <label
                      htmlFor="perm-route"
                      className="block text-sm font-medium text-zinc-700 mb-1"
                    >
                      路由路径
                    </label>
                    <input
                      id="perm-route"
                      type="text"
                      value={form.routePath}
                      onChange={(e) => setForm((f) => ({ ...f, routePath: e.target.value }))}
                      placeholder="/users"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="perm-component"
                      className="block text-sm font-medium text-zinc-700 mb-1"
                    >
                      组件路径
                    </label>
                    <input
                      id="perm-component"
                      type="text"
                      value={form.component}
                      onChange={(e) => setForm((f) => ({ ...f, component: e.target.value }))}
                      placeholder="views/system/user"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isHidden}
                        onChange={(e) => setForm((f) => ({ ...f, isHidden: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">在菜单栏隐藏</span>
                    </label>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="perm-sort" className="block text-sm font-medium text-zinc-700 mb-1">
                  排序
                </label>
                <input
                  id="perm-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900"
                  >
                    {formMode === 'edit' ? '保存' : '创建'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
