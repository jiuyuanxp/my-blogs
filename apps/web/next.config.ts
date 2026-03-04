import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '我的个人博客';
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  '分享技术知识和生活感悟的个人博客';
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@yourhandle';

// 本地开发时设为空，直接访问 http://localhost:3000；生产环境用 /web 配合 Nginx
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/web';

const nextConfig: NextConfig = {
  basePath: basePath || '',
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
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
