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
      const segments = pathname.split('/');
      segments[1] = newLocale;
      router.push(segments.join('/'));
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
