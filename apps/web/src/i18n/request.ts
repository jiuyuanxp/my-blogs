import { getRequestConfig } from 'next-intl/server';

export const locales = ['zh', 'en'] as const;
export const defaultLocale = 'zh' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}`)).default,
  };
});
