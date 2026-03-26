import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchArticles, fetchCategories, isApiError } from '@/lib/api';
import { findCategoryById, toCategoryNodes } from '@/lib/category-utils';
import { getCanonicalUrl } from '@/lib/site-url';
import CategoryPageClient from '@/components/CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
}

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'jiuyuan.blog';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category: categoryId } = await params;
  const t = await getTranslations({ locale, namespace: 'category' });

  let categoryName = categoryId;
  try {
    const cats = await fetchCategories();
    const nodes = toCategoryNodes(cats);
    categoryName = findCategoryById(nodes, categoryId)?.name ?? categoryId;
  } catch {
    /* 元数据降级为 id */
  }

  const title = t('title').replace('{category}', categoryName);
  const description = t('subtitle').replace('{category}', categoryName);
  const canonical = getCanonicalUrl(`/${locale}/category/${encodeURIComponent(categoryId)}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      siteName,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;

  let articles: Awaited<ReturnType<typeof fetchArticles>>['data'] = [];
  let categories: ReturnType<typeof toCategoryNodes> = [];
  let errorMessage: string | undefined;

  try {
    const [artsRes, cats] = await Promise.all([
      fetchArticles({ categoryId, status: 'published' }),
      fetchCategories(),
    ]);
    articles = artsRes.data;
    categories = toCategoryNodes(cats);
  } catch (err) {
    errorMessage = isApiError(err) ? err.message : err instanceof Error ? err.message : undefined;
  }

  return (
    <CategoryPageClient
      articles={articles}
      categories={categories}
      categoryId={categoryId}
      errorMessage={errorMessage}
    />
  );
}
