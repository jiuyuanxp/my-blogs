'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { MOCK_ARTICLES, MOCK_COMMENTS } from '@/data/mock';

function getLocaleFromPath(pathname: string): 'zh' | 'en' {
  const segments = pathname.split('/');
  const loc = segments[1];
  return loc === 'en' ? 'en' : 'zh';
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;
  const articleId = parseInt(id, 10);
  const t = useTranslations('common');
  const dateFormat = t('dateFormat');
  const dateTimeFormat = t('dateTimeFormat');

  const article = MOCK_ARTICLES.find(a => a.id === articleId);
  const comments = article ? (MOCK_COMMENTS[article.id] ?? []) : [];

  const locale = getLocaleFromPath(pathname);
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  return (
    <article className="max-w-3xl mx-auto relative">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute -left-16 top-2 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        title={t('back')}
        aria-label={t('back')}
      >
        <ArrowLeft size={20} aria-hidden />
      </button>

      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-medium focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft size={18} aria-hidden />
          {t('back')}
        </button>
      </div>

      {!article ? (
        <div className="text-center py-20 text-red-500">
          {t('articleNotFound')}
        </div>
      ) : (
        <>
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 text-sm text-stone-500 dark:text-stone-400 mb-6 font-mono">
              <Link
                href={`/${locale}/category/${article.category}`}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider font-medium focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
              >
                {article.category}
              </Link>
              <span className="text-stone-300 dark:text-stone-700" aria-hidden>
                •
              </span>
              <time dateTime={article.created_at}>
                {format(new Date(article.created_at), dateFormat, {
                  locale: dateLocale,
                })}
              </time>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight mb-8 text-balance">
              {article.title}
            </h1>
          </header>

          <div className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-20 prose-headings:font-serif prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          <hr className="border-stone-200 dark:border-stone-800 mb-12" />

          <section className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-100 dark:border-stone-800">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-8">
              {t('comments')} ({comments.length})
            </h2>

            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-stone-500 dark:text-stone-400 italic text-center py-4">
                  {t('noComments')}
                </p>
              ) : (
                comments.map(comment => (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-stone-400">
                        {format(new Date(comment.created_at), dateTimeFormat, {
                          locale: dateLocale,
                        })}
                      </span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
