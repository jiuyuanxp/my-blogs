/**
 * 权限树形复选框 - 基于 antd Tree checkable
 * 用于角色分配权限：父子联动、半选状态
 */
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Permission } from '@/lib/api';

export interface PermissionTreeCheckboxProps {
  data: Permission[];
  checkedKeys: Set<string>;
  onCheck: (checkedKeys: Set<string>) => void;
}

interface PermissionTreeNode extends DataNode {
  permission: Permission;
  children?: PermissionTreeNode[];
}

function toTreeData(permissions: Permission[]): PermissionTreeNode[] {
  return permissions.map((p) => ({
    key: p.id,
    title: (
      <span>
        <span className={p.type === 'menu' ? 'font-medium' : 'text-zinc-500'}>{p.name}</span>
        <span className="text-zinc-400 font-mono text-xs ml-1">({p.code})</span>
      </span>
    ),
    permission: p,
    children: p.children?.length ? toTreeData(p.children) : undefined,
  }));
}

export function PermissionTreeCheckbox({
  data,
  checkedKeys,
  onCheck,
}: PermissionTreeCheckboxProps) {
  const treeData = toTreeData(data);
  const keys = Array.from(checkedKeys);

  return (
    <div className="overflow-y-auto max-h-96 border border-zinc-200 rounded-lg p-2">
      {treeData.length === 0 ? (
        <p className="text-zinc-500 text-sm py-4 text-center">暂无权限数据</p>
      ) : (
        <Tree
          checkable
          showLine
          blockNode
          checkedKeys={keys}
          treeData={treeData}
          onCheck={(checked) => {
            const arr = Array.isArray(checked) ? checked : checked.checked;
            onCheck(new Set(arr.map(String)));
          }}
        />
      )}
    </div>
  );
}
