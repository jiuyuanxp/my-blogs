import { fetchArticles, fetchCategories, isApiError } from '@/lib/api';
import { toCategoryNodes } from '@/lib/category-utils';
import CategoryPageClient from '@/components/CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
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
