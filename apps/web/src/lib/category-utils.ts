/**
 * 分类树工具函数
 * 从页面逻辑抽取，便于复用与测试
 */

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

export function toCategoryNodes(
  cats: { id: string; name: string; children?: unknown[] }[]
): CategoryNode[] {
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children?.length
      ? toCategoryNodes(c.children as { id: string; name: string; children?: unknown[] }[])
      : undefined,
  }));
}

export function findCategoryById(nodes: CategoryNode[], id: string): CategoryNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const found = findCategoryById(n.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function getCategoryIdsIncludingChildren(node: CategoryNode): string[] {
  const result = [node.id];
  if (node.children?.length) {
    for (const child of node.children) {
      result.push(...getCategoryIdsIncludingChildren(child));
    }
  }
  return result;
}
