'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { MOCK_ARTICLES } from '@/data/mock';

function getLocaleFromPath(pathname: string): 'zh' | 'en' {
  const segments = pathname.split('/');
  const loc = segments[1];
  return loc === 'en' ? 'en' : 'zh';
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const t = useTranslations('common');
  const tCategory = useTranslations('category');
  const dateFormat = t('dateFormat');
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  const articles = MOCK_ARTICLES.filter(
    a => a.category === category || a.category.startsWith(category + '/')
  );

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 capitalize text-balance">
          {tCategory('title').replace('{category}', category ?? '')}
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
          {tCategory('subtitle').replace('{category}', category ?? '')}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-stone-500 dark:text-stone-400">
          {t('noArticlesInCategory')}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/${locale}/article/${article.id}`}
              className="group block p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-600 transition-all focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-2xl"
            >
              <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400 mb-3">
                <span className="bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-md text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                  {article.category}
                </span>
                <time dateTime={article.created_at}>
                  {format(new Date(article.created_at), dateFormat, {
                    locale: dateLocale,
                  })}
                </time>
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {article.title}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 line-clamp-3 text-sm leading-relaxed">
                {article.summary}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
