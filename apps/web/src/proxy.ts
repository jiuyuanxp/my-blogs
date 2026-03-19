import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

// next-intl 会根据 Accept-Language、cookie、pathname 自动识别并重定向到 /zh 或 /en
const handleI18n = createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
});

export function proxy(request: NextRequest) {
  return handleI18n(request);
}

export const config = {
  matcher: ['/', '/((?!_next|_vercel|.*\\..*).*)'],
};
