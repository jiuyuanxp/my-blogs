import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { parseDateTime } from '@blog/utils';
import { fetchArticle, fetchCommentsByArticle, isApiError } from '@/lib/api';
import { articleMetaDescription } from '@/lib/article-excerpt';
import { getCanonicalUrl } from '@/lib/site-url';
import ArticlePageClient from '@/components/ArticlePageClient';

interface ArticlePageProps {
  params: Promise<{ locale: string; id: string }>;
}

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'jiuyuan.blog';
const defaultOgImage = process.env.NEXT_PUBLIC_OG_IMAGE || '/og-image.png';

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, id } = await params;

  let article: Awaited<ReturnType<typeof fetchArticle>> | null = null;
  try {
    article = await fetchArticle(id, false);
  } catch (err) {
    if (isApiError(err) && err.status === 404) {
      notFound();
    }
    return { title: siteName };
  }

  if (!article) {
    notFound();
  }

  const description = articleMetaDescription(article);
  const canonical = getCanonicalUrl(`/${locale}/article/${id}`);
  const publishedIso = parseDateTime(article.createdAt).toISOString();
  const modifiedIso = article.updatedAt
    ? parseDateTime(article.updatedAt).toISOString()
    : publishedIso;
  const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_US';

  return {
    title: article.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: article.title,
      description,
      siteName,
      locale: ogLocale,
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [defaultOgImage],
    },
  };
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
