'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  return segments[1] ?? 'zh';
}

function localizePath(pathname: string, newPath: string): string {
  const locale = getLocaleFromPath(pathname);
  const base = newPath.startsWith('/') ? newPath : `/${newPath}`;
  return `/${locale}${base}`;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const t = useTranslations('common');
  const homePath = localizePath(pathname, '/');
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0c0c] text-stone-900 dark:text-stone-100 font-sans transition-[background-color,color] duration-300 motion-reduce:transition-none selection:bg-indigo-500/20">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:items-center focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible focus:whitespace-normal focus:clip-auto"
      >
        {t('skipToContent')}
      </a>
      <header className="sticky top-0 z-50 glass transition-[background-color,border-color] duration-300 motion-reduce:transition-none border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href={homePath}
            className="text-2xl font-serif font-bold tracking-tight hover:text-stone-600 dark:hover:text-stone-300 touch-manipulation transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
          >
            jiuyuan<span className="text-indigo-500">.</span>blog
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border-l border-stone-200 dark:border-stone-800 pl-6">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 touch-manipulation transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-label={theme === 'light' ? t('themeDark') : t('themeLight')}
              >
                {theme === 'light' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-12" tabIndex={-1}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800/50 py-12 mt-12 bg-white dark:bg-[#0c0c0c] transition-[background-color,border-color] duration-300 motion-reduce:transition-none">
        <div className="max-w-7xl mx-auto px-6 text-center text-stone-500 dark:text-stone-500 text-sm flex flex-col items-center gap-4 font-mono">
          <p>
            &copy; {new Date().getFullYear()} {t('footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
