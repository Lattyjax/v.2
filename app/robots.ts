import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/thank-you'],
      },
    ],
    // Use the production domain for the sitemap to avoid pointing at old preview domains
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://latimorelifelegacy.com'}/sitemap.xml`,
  }
}
