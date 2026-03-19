/**
 * 权限树形控件 - 基于 antd Tree
 * 用于权限管理：展示树形结构，每节点带添加子节点、删除操作
 */
import { Tree, Button } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Permission } from '@/lib/api';

export interface PermissionTreeProps {
  data: Permission[];
  selectedId: string | null;
  onSelect: (node: Permission | null) => void;
  onAddRoot?: () => void;
  onAddChild?: (parent: Permission) => void;
  onDelete?: (node: Permission) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}

interface PermissionTreeNode extends DataNode {
  permission: Permission;
  children?: PermissionTreeNode[];
}

function toTreeData(permissions: Permission[]): PermissionTreeNode[] {
  return permissions.map((p) => ({
    key: p.id,
    title: p.name,
    permission: p,
    children: p.children?.length ? toTreeData(p.children) : undefined,
  }));
}

export function PermissionTree({
  data,
  selectedId,
  onSelect,
  onAddRoot,
  onAddChild,
  onDelete,
  canAdd = true,
  canDelete = true,
}: PermissionTreeProps) {
  const treeData = toTreeData(data);

  const titleRender = (nodeData: DataNode) => {
    const { permission } = nodeData as PermissionTreeNode;
    return (
      <div className="flex items-center justify-between gap-2 group/row ant-tree-title">
        <span className="min-w-0 truncate">
          <span className={permission.type === 'menu' ? 'font-medium' : 'text-zinc-500'}>
            {permission.name}
          </span>
          <span className="text-zinc-400 font-mono text-xs ml-1">({permission.code})</span>
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
          {canAdd && permission.type === 'menu' && (
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.(permission);
              }}
              aria-label="添加子节点"
            />
          )}
          {canDelete && (
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(permission);
              }}
              aria-label="删除"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {onAddRoot && canAdd && (
        <Button type="dashed" block icon={<PlusOutlined />} onClick={onAddRoot} className="mb-2">
          添加根节点
        </Button>
      )}
      <div className="flex-1 overflow-y-auto min-h-0">
        {treeData.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center">暂无权限数据</p>
        ) : (
          <Tree
            showLine
            blockNode
            selectedKeys={selectedId ? [selectedId] : []}
            treeData={treeData}
            titleRender={titleRender}
            onSelect={(selectedKeys, info) => {
              if (!info.selected || selectedKeys.length === 0) {
                onSelect(null);
                return;
              }
              const perm = (info.node as PermissionTreeNode).permission;
              onSelect(perm);
            }}
          />
        )}
      </div>
    </div>
  );
}
