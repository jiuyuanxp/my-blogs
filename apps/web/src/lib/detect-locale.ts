import type { Locale } from '@/i18n/request';

// 支持的语言
export const LOCALES = ['zh', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'zh';

// 从 Accept-Language 头检测语言
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // 解析 Accept-Language 头
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, quality = '1'] = lang.trim().split(';q=');
      return { code: code.toLowerCase().split('-')[0], quality: parseFloat(quality) };
    })
    .sort((a, b) => b.quality - a.quality);

  // 查找支持的语言
  for (const lang of languages) {
    if (LOCALES.includes(lang.code as Locale)) {
      return lang.code as Locale;
    }
  }

  return DEFAULT_LOCALE;
}
