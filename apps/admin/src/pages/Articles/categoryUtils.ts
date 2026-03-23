import type { Article, Category } from '@blog/types';

export function getSubCategories(flatCats: Category[], parentId: string): Category[] {
  const subs = flatCats.filter((c) => c.parentId === parentId);
  let allSubs = [...subs];
  subs.forEach((s) => {
    allSubs = [...allSubs, ...getSubCategories(flatCats, s.id)];
  });
  return allSubs;
}

export function filterArticlesByCategoryTabs(
  articles: Article[],
  flatCats: Category[],
  activeTabId: string | 'all',
  selectedSubCatId: string | 'all'
): Article[] {
  if (activeTabId === 'all' && selectedSubCatId === 'all') return articles;
  return articles.filter((a) => {
    if (selectedSubCatId !== 'all') return a.categoryId === selectedSubCatId;
    if (activeTabId !== 'all') {
      const subIds = getSubCategories(flatCats, activeTabId).map((c) => c.id);
      return subIds.includes(a.categoryId) || a.categoryId === activeTabId;
    }
    return true;
  });
}
