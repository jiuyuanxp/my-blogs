import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/request';
import { fetchArticles, fetchCategories } from '@/lib/api';
import { parseDateTime } from '@blog/utils';
import { getCanonicalUrl } from '@/lib/site-url';

function flattenCategories(
  cats: { id: string; name: string; children?: unknown[] }[]
): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  for (const c of cats) {
    result.push({ id: c.id, name: c.name });
    if (c.children?.length) {
      result.push(
        ...flattenCategories(c.children as { id: string; name: string; children?: unknown[] }[])
      );
    }
  }
  return result;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const [artsRes, cats] = await Promise.all([
      fetchArticles({ status: 'published', pageSize: 1000 }),
      fetchCategories(),
    ]);
    const articles = artsRes.data;
    const categories = flattenCategories(cats);

    for (const locale of locales) {
      entries.push({
        url: getCanonicalUrl(`/${locale}`),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
      });

      for (const article of articles) {
        entries.push({
          url: getCanonicalUrl(`/${locale}/article/${article.id}`),
          lastModified: parseDateTime(article.createdAt),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });
      }

      for (const category of categories) {
        entries.push({
          url: getCanonicalUrl(`/${locale}/category/${encodeURIComponent(category.id)}`),
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }
    }
  } catch {
    for (const locale of locales) {
      entries.push({
        url: getCanonicalUrl(`/${locale}`),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
      });
    }
  }

  return entries;
}
