import type { Article, Category } from '@blog/types';

/** 某分类及其所有后代 id（含自身），用于「选中节点 = 该子树下全部文章」 */
export function getSubtreeCategoryIds(flatCats: Category[], categoryId: string): string[] {
  const direct = flatCats.filter((c) => c.parentId === categoryId);
  const below = direct.flatMap((c) => getSubtreeCategoryIds(flatCats, c.id));
  return [categoryId, ...below];
}

export function filterArticlesByCategory(
  articles: Article[],
  flatCats: Category[],
  filterCategoryId: string | 'all'
): Article[] {
  if (filterCategoryId === 'all') return articles;
  const allowed = new Set(getSubtreeCategoryIds(flatCats, filterCategoryId));
  return articles.filter((a) => allowed.has(a.categoryId));
}

export type CategoryFilterOption = { value: string; label: string };

/** 按树深度优先遍历，label 为「父 / 子 / …」路径，任意深度可读 */
export function buildCategoryFilterPathOptions(categories: Category[]): CategoryFilterOption[] {
  const walk = (nodes: Category[] | undefined, ancestors: string[]): CategoryFilterOption[] => {
    if (!nodes?.length) return [];
    const out: CategoryFilterOption[] = [];
    for (const n of nodes) {
      const path = [...ancestors, n.name];
      out.push({ value: n.id, label: path.join(' / ') });
      if (n.children?.length) {
        out.push(...walk(n.children, path));
      }
    }
    return out;
  };
  return walk(categories, []);
}
