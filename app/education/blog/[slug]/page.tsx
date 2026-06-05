import Link from 'next/link'
import { notFound } from 'next/navigation'
import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { getAllSlugs, getPostBySlug, getPostsByCategory } from '@/lib/blog'
import { getMDXComponents } from '@/components/blog/mdx-components'
import { NewBlogCard } from '@/components/blog/BlogCard'
import PostCTABanner from '@/components/blog/PostCTABanner'
import AuthorBio from '@/components/blog/AuthorBio'
import ShareButtons from '@/components/blog/ShareButtons'
import BlogCTA from '@/components/blog/BlogCTA'
import TableOfContents from '@/components/blog/TableOfContents'
import { SiteHeader, SiteFooter, DEFAULT_NAV_LINKS } from '@/app/_components/site-shell'
import ArticleAnalytics from '@/components/blog/ArticleAnalytics'
import type { Metadata } from 'next'
import '@/styles/blog.css'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://latimorelifelegacy.com'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = getPostBySlug(slug)
  if (!result) return { title: 'Not Found' }
  const { post } = result
  const title = post.seoTitle ?? post.title
  const description = post.seoDescription ?? post.description
  const url = `${BASE}/education/blog/${slug}`

  return {
    title: `${title} | Latimore Life & Legacy`,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      ...(post.image ? { images: [{ url: post.image, alt: post.imageAlt ?? title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function extractHeadings(content: string) {
  const lines = content.split('\n')
  const headings: { id: string; text: string; level: number }[] = []
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/)
    if (m) {
      const level = m[1].length
      const text = m[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      headings.push({ id, text, level })
    }
  }
  return headings
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = getPostBySlug(slug)
  if (!result) notFound()

  const { post, content } = result
  const headings = extractHeadings(content)
  const related = getPostsByCategory(post.category)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  const postUrl = `${BASE}/education/blog/${slug}`

  // Compile and evaluate MDX
  const { default: MDXContent } = await evaluate(content, {
    ...(runtime as Parameters<typeof evaluate>[1]),
    development: false,
  })

  const components = getMDXComponents()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Latimore Life & Legacy LLC',
      url: BASE,
    },
    ...(post.image ? { image: post.image } : {}),
    url: postUrl,
  }

  return (
    <>
      <ArticleAnalytics slug={post.slug} title={post.title} category={post.category} />
      <SiteHeader currentPath="/education/blog" navLinks={DEFAULT_NAV_LINKS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Post hero */}
      <div className="blog-hero" style={{ paddingBottom: '2rem' }}>
        <div className="blog-hero__inner">
          <p className="blog-hero__breadcrumb">
            <Link href="/">Home</Link> &rsaquo;{' '}
            <Link href="/education">Education</Link> &rsaquo;{' '}
            <Link href="/education/blog">Blog</Link> &rsaquo;{' '}
            <Link href={`/education/blog?category=${encodeURIComponent(post.category)}`}>
              {post.category}
            </Link>
          </p>
          <h1 className="blog-hero__title" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>
            {post.title}
          </h1>
          <p className="blog-hero__description">{post.description}</p>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>By {post.author}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#f9fafb' }}>
        <div className="post-layout">
          {/* Main article */}
          <main>
            <article className="post-content">
              <MDXContent components={components} />
            </article>

            <PostCTABanner type={post.cta} />
            <AuthorBio author={post.author} />
            <ShareButtons title={post.title} url={postUrl} />

            {/* Related posts */}
            {related.length > 0 && (
              <div className="related-posts">
                <h2 className="related-posts__title">More in {post.category}</h2>
                <div className="related-posts__grid">
                  {related.map((rp) => (
                    <NewBlogCard key={rp.slug} post={rp} />
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="post-layout__sidebar blog-sidebar">
            <TableOfContents headings={headings} />
            <BlogCTA />
          </aside>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
