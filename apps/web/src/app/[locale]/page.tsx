'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CategoryTree, { type CategoryNode } from '@/components/CategoryTree';
import { fetchArticles, fetchCategories } from '@/lib/api';
import type { Article } from '@/types';
import { Menu, Pin } from 'lucide-react';

function getLocaleFromPath(pathname: string): 'zh' | 'en' {
  const segments = pathname.split('/');
  const loc = segments[1];
  return loc === 'en' ? 'en' : 'zh';
}

function toCategoryNodes(
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

function findCategoryById(nodes: CategoryNode[], id: string): CategoryNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const found = findCategoryById(n.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function getCategoryIdsIncludingChildren(node: CategoryNode): string[] {
  const result = [node.id];
  if (node.children?.length) {
    for (const child of node.children) {
      result.push(...getCategoryIdsIncludingChildren(child));
    }
  }
  return result;
}

export default function HomePage() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const dateFormat = tCommon('dateFormat');

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categoryTree = categories;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [artsRes, cats] = await Promise.all([
          fetchArticles({ status: 'published' }),
          fetchCategories(),
        ]);
        setArticles(artsRes.data);
        setCategories(toCategoryNodes(cats));
      } catch {
        setArticles([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredArticles =
    selectedCategoryId === 'all'
      ? articles
      : articles.filter((a) => {
          const cat = findCategoryById(categories, selectedCategoryId);
          if (!cat) return a.categoryId === selectedCategoryId;
          const ids = getCategoryIdsIncludingChildren(cat);
          return ids.includes(a.categoryId);
        });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const articleLink = (article: Article) => `/${locale}/article/${article.id}`;

  const displayCategory =
    selectedCategoryId === 'all'
      ? tCommon('all')
      : (findCategoryById(categories, selectedCategoryId)?.name ?? selectedCategoryId);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-6 mb-12 py-8 border-b border-stone-200 dark:border-stone-800/50">
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 text-balance">
          {t('latestArticles')}
        </h1>
        <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 max-w-2xl mx-auto font-light leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] gap-16 items-start">
        <div className="lg:hidden mb-6">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-700 dark:text-stone-300 shadow-sm w-full font-medium focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-expanded={isSidebarOpen}
            aria-controls="category-sidebar"
          >
            <Menu size={20} aria-hidden />
            <span>{displayCategory}</span>
          </button>
        </div>

        <aside
          id="category-sidebar"
          className={`
          lg:block
          ${isSidebarOpen ? 'block' : 'hidden'}
          sticky top-28
          max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-auto
          scrollbar-hide
        `}
        >
          <div className="bg-white dark:bg-stone-900/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-800/50 shadow-sm backdrop-blur-sm">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 px-2 font-mono">
              {tCommon('category')}
            </h2>
            <div className="min-w-max">
              <CategoryTree
                categories={categoryTree}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(id) => {
                  setSelectedCategoryId(id);
                  setIsSidebarOpen(false);
                }}
                allLabel={tCommon('all')}
              />
            </div>
          </div>
        </aside>

        <div className="grid gap-8">
          {loading ? (
            <div className="text-center py-32 text-stone-400 dark:text-stone-600">
              {tCommon('loading') || '加载中…'}
            </div>
          ) : sortedArticles.length === 0 ? (
            <div className="text-center py-32 text-stone-400 dark:text-stone-600 bg-stone-50 dark:bg-stone-900/30 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-lg font-serif italic">{tCommon('noArticlesInCategory')}</p>
            </div>
          ) : (
            sortedArticles.map((article) => (
              <Link
                key={article.id}
                href={articleLink(article)}
                className={`group block p-8 rounded-3xl transition-all duration-300 relative overflow-hidden
                  ${
                    article.isPinned
                      ? 'bg-stone-50 dark:bg-stone-900/80 border border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-lg hover:shadow-indigo-500/5'
                      : 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-none hover:-translate-y-1'
                  }
                `}
              >
                {article.isPinned === 1 && (
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Pin size={12} className="fill-current" aria-hidden />
                    <span>Pinned</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs font-medium text-stone-400 dark:text-stone-500 mb-4 font-mono">
                  <span className="text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    {article.categoryName ?? ''}
                  </span>
                  <span aria-hidden>•</span>
                  <time dateTime={article.createdAt}>
                    {format(new Date(article.createdAt), dateFormat, {
                      locale: dateLocale,
                    })}
                  </time>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-serif leading-tight">
                  {article.title}
                </h2>

                <p className="text-stone-600 dark:text-stone-400 line-clamp-3 text-base leading-relaxed font-light">
                  {article.summary}
                </p>

                <div className="mt-6 flex items-center text-sm font-medium text-stone-900 dark:text-stone-100 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                  {tCommon('readMore')}{' '}
                  <span className="ml-2" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
