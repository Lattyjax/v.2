import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

export const BLOG_CATEGORIES = [
  'Life Insurance',
  'Annuities & Retirement',
  'Estate & Legacy Planning',
  'Business Protection',
  'College Funding',
  'Debt & Mortgage',
  'Financial Literacy',
  'Community & Advocacy',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  author: string
  category: string
  tags: string[]
  image?: string
  imageAlt?: string
  featured: boolean
  cta: 'consultation' | 'quote' | 'assessment' | 'none'
  seoTitle?: string
  seoDescription?: string
  readingTime: number
  // legacy fields kept for compatibility
  excerpt?: string
  publishedAt?: string
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

function normalizePost(slug: string, data: Record<string, unknown>, content: string): BlogPost {
  return {
    slug,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? (data.excerpt as string) ?? '',
    date: (data.date as string) ?? (data.publishedAt as string) ?? '',
    updated: data.updated as string | undefined,
    author: (data.author as string) ?? 'Jackson M. Latimore Sr.',
    category: (data.category as string) ?? 'Financial Literacy',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    image: data.image as string | undefined,
    imageAlt: data.imageAlt as string | undefined,
    featured: Boolean(data.featured),
    cta: (['consultation', 'quote', 'assessment', 'none'].includes(data.cta as string)
      ? (data.cta as BlogPost['cta'])
      : 'consultation'),
    seoTitle: data.seoTitle as string | undefined,
    seoDescription: data.seoDescription as string | undefined,
    readingTime: calcReadingTime(content),
    excerpt: data.excerpt as string | undefined,
    publishedAt: data.publishedAt as string | undefined,
  }
}

function readAllFiles(): { slug: string; data: Record<string, unknown>; content: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')
      const { data, content } = matter(raw)
      return { slug, data: data as Record<string, unknown>, content }
    })
}

export function getAllPosts(): BlogPost[] {
  return readAllFiles()
    .map(({ slug, data, content }) => normalizePost(slug, data, content))
    .sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return db - da
    })
}

export function getFeaturedPosts(): BlogPost[] {
  return getAllPosts().filter((p) => p.featured)
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getPostBySlug(slug: string): { post: BlogPost; content: string } | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const post = normalizePost(slug, data as Record<string, unknown>, content)
  return { post, content }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .map((f) => f.replace(/\.mdx$/, ''))
}
