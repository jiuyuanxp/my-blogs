import type { MetadataRoute } from 'next';
import { getCanonicalUrl, getPublicSiteOrigin } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const host = getPublicSiteOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: getCanonicalUrl('/sitemap.xml'),
    host,
  };
}
