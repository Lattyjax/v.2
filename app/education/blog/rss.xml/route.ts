import { getAllPosts } from '@/lib/blog'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://latimorelifelegacy.com'

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const posts = getAllPosts()

  const items = posts
    .map((post) => {
      const link = `${BASE}/education/blog/${post.slug}`
      return `
    <item>
      <title>${escape(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${new Date(post.date + 'T00:00:00').toUTCString()}</pubDate>
      <category>${escape(post.category)}</category>
      <author>jackson1989@latimorelegacy.com (${escape(post.author)})</author>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Latimore Life &amp; Legacy — Financial Education Blog</title>
    <link>${BASE}/education/blog</link>
    <description>Plain-language financial guidance on life insurance, annuities, estate planning, and more.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/education/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
