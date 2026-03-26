import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchArticles, fetchCategories, isApiError } from '@/lib/api';
import { toCategoryNodes } from '@/lib/category-utils';
import { getCanonicalUrl } from '@/lib/site-url';
import HomePageClient from '@/components/HomePageClient';

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'jiuyuan.blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const description = t('subtitle');
  const canonical = getCanonicalUrl(`/${locale}`);

  return {
    title: siteName,
    description,
    alternates: { canonical },
    openGraph: {
      title: siteName,
      description,
      url: canonical,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function HomePage() {
  let articles: Awaited<ReturnType<typeof fetchArticles>>['data'] = [];
  let categories: ReturnType<typeof toCategoryNodes> = [];
  let errorMessage: string | undefined;

  try {
    const [artsRes, cats] = await Promise.all([
      fetchArticles({ status: 'published' }),
      fetchCategories(),
    ]);
    articles = artsRes.data;
    categories = toCategoryNodes(cats);
  } catch (err) {
    errorMessage = isApiError(err) ? err.message : err instanceof Error ? err.message : undefined;
  }

  return <HomePageClient articles={articles} categories={categories} errorMessage={errorMessage} />;
}
