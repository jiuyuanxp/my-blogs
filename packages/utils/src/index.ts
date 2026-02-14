// String Utils
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

export function isNotEmpty(str: string | null | undefined): boolean {
  return str !== null && str !== undefined && str.trim().length > 0;
}

export function isEmpty(str: string | null | undefined): boolean {
  return !isNotEmpty(str);
}

export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

export function removeHtmlTags(str: string): string {
  return str.replace(/<[^>]*>?/gi, '');
}

export function countWords(str: string): number {
  return str.trim().split(/\s+/).length;
}

export function countChars(str: string, spaces = false): number {
  if (spaces) return str.length;
  return str.replace(/\s/g, '').length;
}

export function escapeHtml(str: string): string {
  const htmlMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, (char) => htmlMap[char]);
}

export function unescapeHtml(str: string): string {
  const htmlMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (char) => htmlMap[char]);
}

export function generateId(prefix = 'id-'): string {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function asyncSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function getDomain(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed ? parsed.hostname : null;
}

export function getBaseUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;
  return `${parsed.protocol}//${parsed.host}`;
}

export function getQueryString(url: string): Record<string, string> {
  const parsed = parseUrl(url);
  if (!parsed) return {};
  const params: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
}
