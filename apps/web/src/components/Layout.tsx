'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Moon, Sun, Languages } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0c0c] text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300 selection:bg-indigo-500/20">
      <header className="sticky top-0 z-50 glass transition-colors duration-300 border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href={homePath}
            className="text-2xl font-serif font-bold tracking-tight hover:text-stone-600 dark:hover:text-stone-300 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
          >
            jiuyuan<span className="text-indigo-500">.</span>blog
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border-l border-stone-200 dark:border-stone-800 pl-6">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-label={
                  theme === 'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
              >
                {theme === 'light' ? (
                  <Moon size={18} aria-hidden />
                ) : (
                  <Sun size={18} aria-hidden />
                )}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800/50 py-12 mt-12 bg-white dark:bg-[#0c0c0c] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 text-center text-stone-500 dark:text-stone-500 text-sm flex flex-col items-center gap-4 font-mono">
          <p>
            &copy; {new Date().getFullYear()} {t('footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
