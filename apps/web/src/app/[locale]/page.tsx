'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import CategoryTree from '@/components/CategoryTree';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/data/mock';
import type { Article } from '@/types';
import { Menu, Pin } from 'lucide-react';

function getLocaleFromPath(pathname: string): 'zh' | 'en' {
  const segments = pathname.split('/');
  const loc = segments[1];
  return loc === 'en' ? 'en' : 'zh';
}

export default function HomePage() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const dateFormat = tCommon('dateFormat');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredArticles =
    selectedCategory === 'All'
      ? MOCK_ARTICLES
      : MOCK_ARTICLES.filter(
          a =>
            a.category === selectedCategory ||
            a.category.startsWith(selectedCategory + '/')
        );

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const articleLink = (article: Article) => `/${locale}/article/${article.id}`;

  const displayCategory =
    selectedCategory === 'All'
      ? tCommon('all')
      : selectedCategory.split('/').pop();

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
                categories={MOCK_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={cat => {
                  setSelectedCategory(cat);
                  setIsSidebarOpen(false);
                }}
                allLabel={tCommon('all')}
              />
            </div>
          </div>
        </aside>

        <div className="grid gap-8">
          {sortedArticles.length === 0 ? (
            <div className="text-center py-32 text-stone-400 dark:text-stone-600 bg-stone-50 dark:bg-stone-900/30 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-lg font-serif italic">
                {tCommon('noArticlesInCategory')}
              </p>
            </div>
          ) : (
            sortedArticles.map(article => (
              <Link
                key={article.id}
                href={articleLink(article)}
                className={`group block p-8 rounded-3xl transition-all duration-300 relative overflow-hidden
                  ${
                    article.is_pinned
                      ? 'bg-stone-50 dark:bg-stone-900/80 border border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-lg hover:shadow-indigo-500/5'
                      : 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-none hover:-translate-y-1'
                  }
                `}
              >
                {article.is_pinned === 1 && (
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Pin size={12} className="fill-current" aria-hidden />
                    <span>Pinned</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs font-medium text-stone-400 dark:text-stone-500 mb-4 font-mono">
                  <span className="text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    {article.category.split('/').pop()}
                  </span>
                  <span aria-hidden>•</span>
                  <time dateTime={article.created_at}>
                    {format(new Date(article.created_at), dateFormat, {
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
