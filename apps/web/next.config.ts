import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '我的个人博客';
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  '分享技术知识和生活感悟的个人博客';
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@yourhandle';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
