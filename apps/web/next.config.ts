import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 本地开发时设为空，直接访问 http://localhost:3000；生产环境用 /web 配合 Nginx
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/web';

const nextConfig: NextConfig = {
  basePath: basePath || '',
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  output: 'standalone',
  // 根路径由 proxy.ts (next-intl) 根据 Accept-Language 自动重定向到 /zh 或 /en
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
