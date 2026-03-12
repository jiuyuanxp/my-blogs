import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const handleI18n = createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
});

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '/web').replace(/\/$/, '') || '';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // 根路径显式重定向到 /web/zh 或 /zh（无 basePath 时）
  if (pathname === '/' || pathname === '') {
    const redirectPath = basePath ? `${basePath}/zh` : '/zh';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  return handleI18n(request);
}

export const config = {
  matcher: ['/', '/((?!_next|_vercel|.*\\..*).*)'],
};
