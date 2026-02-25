import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '我的个人博客';
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '分享技术知识和生活感悟的个人博客';
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@yourhandle';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: process.env.NEXT_PUBLIC_SEO_KEYWORDS?.split(',') || ['博客', '技术', '编程', '前端', '后端', '微服务'],
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
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

