import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 未设置 env 时：next dev 默认可直接访问 http://localhost:3000/；构建阶段默认可与 Nginx 的 /web 对齐
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.NODE_ENV === 'development' ? '' : '/web');

const nextConfig: NextConfig = {
  basePath: basePath || '',
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  output: 'standalone',
  // 存在 basePath（如 /web）时，把裸域名 "/" 指到应用根（与本地、Docker 后一致）
  ...(basePath
    ? {
        async redirects() {
          const to = basePath.endsWith('/') ? basePath : `${basePath}/`;
          return [{ source: '/', destination: to, permanent: false, basePath: false }];
        },
      }
    : {}),
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
