'use client';

import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { parseDateTime } from '@blog/utils';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import type { Article, Comment } from '@/types';

function ArticleMarkdownBodyLoader() {
  const t = useTranslations('common');
  return (
    <p className="text-stone-500 dark:text-stone-400 py-8" role="status">
      {t('loadingArticle')}
    </p>
  );
}

const ArticleMarkdownBody = dynamic(
  () =>
    import('@/components/ArticleMarkdownBody').then((m) => ({ default: m.ArticleMarkdownBody })),
  { loading: () => <ArticleMarkdownBodyLoader /> }
);

function getLocaleFromPath(pathname: string): 'zh' | 'en' {
  const segments = pathname.split('/');
  const loc = segments[1];
  return loc === 'en' ? 'en' : 'zh';
}

interface ArticlePageClientProps {
  article: Article | null;
  comments: Comment[];
  errorMessage?: string;
}

export default function ArticlePageClient({
  article,
  comments,
  errorMessage,
}: ArticlePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');
  const dateFormat = t('dateFormat');
  const dateTimeFormat = t('dateTimeFormat');
  const locale = getLocaleFromPath(pathname);
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  if (errorMessage) {
    return (
      <article className="max-w-3xl mx-auto">
        <div
          className="text-center py-20 text-red-500 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          <p className="text-lg font-medium">{t('error')}</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      </article>
    );
  }

  if (!article) {
    return (
      <article className="max-w-3xl mx-auto">
        <div className="text-center py-20 text-stone-500 dark:text-stone-400" role="status">
          {t('articleNotFound')}
        </div>
      </article>
    );
  }

  return (
    <article className="max-w-3xl mx-auto relative">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute -left-16 top-2 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 touch-manipulation transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        title={t('back')}
        aria-label={t('back')}
      >
        <ArrowLeft size={20} aria-hidden />
      </button>

      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 touch-manipulation transition-colors motion-reduce:transition-none font-medium focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft size={18} aria-hidden />
          {t('back')}
        </button>
      </div>

      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 text-sm text-stone-500 dark:text-stone-400 mb-6 font-mono">
          <Link
            href={`/${locale}/category/${article.categoryId}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 touch-manipulation transition-colors motion-reduce:transition-none uppercase tracking-wider font-medium focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
          >
            {article.categoryName ?? ''}
          </Link>
          <span className="text-stone-300 dark:text-stone-700" aria-hidden>
            •
          </span>
          <time dateTime={article.createdAt}>
            {format(parseDateTime(article.createdAt), dateFormat, {
              locale: dateLocale,
            })}
          </time>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight mb-8 text-balance">
          {article.title}
        </h1>
      </header>

      <div className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-20 prose-headings:font-serif prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500">
        <ArticleMarkdownBody content={article.content} />
      </div>

      <hr className="border-stone-200 dark:border-stone-800 mb-12" />

      <section className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-100 dark:border-stone-800">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-8 tabular-nums">
          {t('comments')} ({comments.length})
        </h2>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-stone-500 dark:text-stone-400 italic text-center py-4">
              {t('noComments')}
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-stone-400">
                    {format(parseDateTime(comment.createdAt), dateTimeFormat, {
                      locale: dateLocale,
                    })}
                  </span>
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed wrap-break-word">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </article>
  );
}
