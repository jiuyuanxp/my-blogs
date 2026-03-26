/**
 * 面向浏览器/爬虫的公开站点根 URL（含可选 basePath），与 next.config / sitemap 保持一致。
 * 未购域名时可设为 http://localhost:3000 或预览域名；上线后改为正式域名即可。
 */
function normalizeSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

function normalizeBasePath(): string {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!bp || bp === '/') return '';
  return bp.endsWith('/') ? bp.slice(0, -1) : bp;
}

/** 站点来源，无末尾斜杠，不含 basePath */
export function getPublicSiteOrigin(): string {
  return normalizeSiteOrigin();
}

export function getPublicBasePath(): string {
  return normalizeBasePath();
}

/**
 * @param pathname 站内路径，须以 / 开头，例如 /zh/article/1、/sitemap.xml
 */
export function getCanonicalUrl(pathname: string): string {
  const origin = normalizeSiteOrigin();
  const bp = normalizeBasePath();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${bp}${path}`;
}
