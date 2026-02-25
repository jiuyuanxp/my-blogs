import { getTranslations } from 'next-intl/server';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const sampleArticles = [
  {
    id: 1,
    title: 'home.sampleArticle1.title',
    summary: 'home.sampleArticle1.summary',
    date: '2024-01-01',
  },
  {
    id: 2,
    title: 'home.sampleArticle2.title',
    summary: 'home.sampleArticle2.summary',
    date: '2023-12-15',
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {t('home.welcome')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{t('home.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </header>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {t('home.latestArticles')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {sampleArticles.map((article) => (
              <article
                key={article.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
              >
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(article.date), 'yyyy年MM月dd日', { locale: dateLocale })}
                </time>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {t(article.title)}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t(article.summary)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-blue-50 p-8 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-50">
            {t('home.aboutMe')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{t('home.aboutDescription')}</p>
        </section>
      </main>
    </div>
  );
}
