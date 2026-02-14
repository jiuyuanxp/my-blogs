import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "我的个人博客",
    template: "%s | 我的个人博客",
  },
  description: "分享技术知识和生活感悟的个人博客",
  keywords: ["博客", "技术", "编程", "前端", "后端", "微服务"],
  authors: [{ name: "Your Name", url: "https://yourdomain.com" }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://yourdomain.com",
    title: "我的个人博客",
    description: "分享技术知识和生活感悟的个人博客",
    siteName: "我的个人博客",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "我的个人博客",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "我的个人博客",
    description: "分享技术知识和生活感悟的个人博客",
    images: ["/og-image.png"],
    creator: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
