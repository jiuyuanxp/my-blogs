import { fetchArticles, fetchCategories, isApiError } from '@/lib/api';
import { toCategoryNodes } from '@/lib/category-utils';
import HomePageClient from '@/components/HomePageClient';

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
