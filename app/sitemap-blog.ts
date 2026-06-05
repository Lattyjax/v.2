import { getAllPosts } from '@/lib/blog'
import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://latimorelifelegacy.com'

export function getBlogSitemapEntries(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  return posts.map((post) => ({
    url: `${BASE}/education/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.9 : 0.7,
  }))
}
