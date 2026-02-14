import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async generateSitemaps() {
    return [{ id: 0 }];
  },
  async sitemap({ id }) {
    return [
      {
        url: 'https://yourdomain.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  },
  async robots() {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      sitemap: 'https://yourdomain.com/sitemap.xml',
    };
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
