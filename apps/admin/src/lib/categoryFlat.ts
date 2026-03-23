import type { Category } from '@blog/types';

/** 将树形分类压平为一维列表（子节点不再嵌套 children） */
export function flattenCategories(cats: Category[]): Category[] {
  const result: Category[] = [];
  for (const c of cats) {
    result.push({ ...c, children: undefined });
    if (c.children?.length) {
      result.push(...flattenCategories(c.children));
    }
  }
  return result;
}
