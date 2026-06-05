import { MetadataRoute } from 'next'
import { getBlogSitemapEntries } from './sitemap-blog'

// Resolve the canonical base domain used for generating absolute URLs in the sitemap.
// By default this falls back to the production domain latimorelifelegacy.com rather than the old
// preview domain. It can be overridden by setting NEXT_PUBLIC_BASE_URL at deploy time.
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://latimorelifelegacy.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                          lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/velocity`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/depth`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/group`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/retirement`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/consult`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.9 },
    { url: `${BASE}/book`,                lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.9 },
        
    { url: `${BASE}/book-now`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.9 },

    { url: `${BASE}/about`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${BASE}/education/blog`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/faq`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/legal/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/legal/terms`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/legal/disclosures`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    ...getBlogSitemapEntries(),
  ]
}
