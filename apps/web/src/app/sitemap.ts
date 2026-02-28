import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/request';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/data/mock';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jiuyuan.blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    });

    for (const article of MOCK_ARTICLES) {
      entries.push({
        url: `${baseUrl}/${locale}/article/${article.id}`,
        lastModified: new Date(article.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      });
    }

    for (const category of MOCK_CATEGORIES) {
      entries.push({
        url: `${baseUrl}/${locale}/category/${encodeURIComponent(category)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  return entries;
}
