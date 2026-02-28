import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n/request';
import { ThemeProvider } from '@/components/ThemeProvider';
import Layout from '@/components/Layout';
import '@/app/globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'jiuyuan.blog';
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  '关于 Web 开发和人工智能的思考、教程与见解。';
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@jiuyuanblog';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0c' },
  ],
};

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: process.env.NEXT_PUBLIC_SEO_KEYWORDS?.split(',') || [
      '博客',
      '技术',
      '编程',
      '前端',
      'Web',
      'AI',
    ],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: siteUrl,
      title: siteName,
      description: siteDescription,
      siteName: siteName,
      images: [
        {
          url: process.env.NEXT_PUBLIC_OG_IMAGE || '/og-image.png',
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
      images: [process.env.NEXT_PUBLIC_OG_IMAGE || '/og-image.png'],
      creator: twitterHandle,
    },
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE || '',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <Layout>{children}</Layout>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
