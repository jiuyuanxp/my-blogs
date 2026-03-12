import { notFound } from 'next/navigation';
import { fetchArticle, fetchCommentsByArticle, isApiError } from '@/lib/api';
import ArticlePageClient from '@/components/ArticlePageClient';

interface ArticlePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  let article: Awaited<ReturnType<typeof fetchArticle>> | null = null;
  let comments: Awaited<ReturnType<typeof fetchCommentsByArticle>> = [];
  let errorMessage: string | undefined;

  try {
    const [art, coms] = await Promise.all([fetchArticle(id, true), fetchCommentsByArticle(id)]);
    article = art;
    comments = coms;
  } catch (err) {
    errorMessage = isApiError(err) ? err.message : err instanceof Error ? err.message : undefined;
    if (isApiError(err) && err.status === 404) {
      notFound();
    }
  }

  if (!article && !errorMessage) {
    notFound();
  }

  return <ArticlePageClient article={article} comments={comments} errorMessage={errorMessage} />;
}
