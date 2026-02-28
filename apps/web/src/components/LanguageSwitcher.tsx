'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';

const LOCALES = ['zh', 'en'] as const;
const LABELS: Record<string, string> = { zh: 'CN', en: 'EN' };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    startTransition(() => {
      // usePathname 不含 basePath，pathname 形如 /zh 或 /zh/article/1
      // 替换 locale 段，避免 /web/zh 时误生成 /en/web/zh
      const pathWithoutBase =
        pathname.startsWith('/web/') ? pathname.slice(5) : pathname;
      const segments = pathWithoutBase.split('/').filter(Boolean);
      const localeIndex = segments.findIndex((s) => s === locale);
      if (localeIndex >= 0) {
        segments[localeIndex] = newLocale;
        router.push('/' + segments.join('/'));
      } else {
        router.push(`/${newLocale}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleLocaleChange}
      disabled={isPending}
      className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors flex items-center gap-1 text-xs font-medium font-mono focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
      aria-label="Toggle language"
    >
      <Languages size={18} aria-hidden />
      <span>{LABELS[locale] ?? 'EN'}</span>
    </button>
  );
}
