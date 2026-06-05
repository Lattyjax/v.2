import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { getAllPosts, getPostBySlug, getPostSlugs } from '@/lib/mdx'
import ArticleAnalytics from '@/app/_components/article-analytics'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://latimorelifelegacy.com'

const TRACK_COLOR: Record<string, string> = {
  'Young Families': '#2d5f8a',
  'Pre-Retirees': '#4a7c59',
  'School Districts': '#7a4f2e',
}
const TRACK_BG: Record<string, string> = {
  'Young Families': '#e8f1f8',
  'Pre-Retirees': '#e8f2ec',
  'School Districts': '#f2ebe5',
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = getPostBySlug(slug)
    return {
      title: post.title,
      description: post.excerpt,
      authors: [{ name: post.author }],
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `${BASE_URL}/blog/${slug}`,
        type: 'article',
        publishedTime: post.date,
        authors: [post.author],
        tags: [post.category],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
      },
    }
  } catch {
    return {}
  }
}


export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let post
  try {
    post = getPostBySlug(slug)
  } catch {
    notFound()
  }

  const allPosts = getAllPosts()
  const related = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3)

  const color = TRACK_COLOR[post.category] ?? '#2d5f8a'
  const bg = TRACK_BG[post.category] ?? '#e8f1f8'
  const htmlContent = await marked(post.content)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${BASE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Latimore Life & Legacy LLC',
      url: BASE_URL,
    },
    datePublished: post.date,
    dateModified: post.date,
    url: `${BASE_URL}/blog/${slug}`,
    articleSection: post.category,
    keywords: [post.category, 'life insurance', 'Pennsylvania', 'Coal Region'],
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');
        .prose-article h2 { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:#2C3E50; margin:2rem 0 0.875rem; border-left:3px solid #C49A6C; padding-left:1rem; }
        .prose-article h2:first-child { margin-top:0; }
        .prose-article p { margin-bottom:1.25rem; color:#1a1a1a; font-size:16px; line-height:1.8; }
        .prose-article ul { margin:0.5rem 0 1.25rem 1.5rem; }
        .prose-article li { margin-bottom:0.5rem; color:#1a1a1a; font-size:16px; line-height:1.7; }
        .prose-article strong { color:#2C3E50; }
        .prose-article hr { border:none; border-top:1px solid #e2dcd4; margin:2rem 0; }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <ArticleAnalytics
        slug={slug}
        title={post.title}
        category={post.category}
        author={post.author}
        readingTime={post.readingTime}
      />

      <div
        className="min-h-screen bg-[#f9f6f0] text-[#1a1a1a]"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        {/* Header */}
        <header className="bg-[#1a2530] border-b-2 border-[#C49A6C] px-8 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between h-16 gap-8">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div
                className="w-9 h-9 bg-[#C49A6C] shrink-0"
                style={{ clipPath: 'polygon(50% 0%,100% 20%,100% 70%,50% 100%,0% 70%,0% 20%)' }}
              />
              <div>
                <div
                  className="text-base font-bold text-white leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Latimore Life &amp; Legacy
                </div>
                <div className="font-mono text-[9px] text-[#C49A6C] tracking-[0.12em] uppercase">
                  Protecting Today. Securing Tomorrow.
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex gap-7">
              {[['/', 'Home'], ['/about', 'About'], ['/products', 'Products'], ['/contact', 'Contact']].map(
                ([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-white/75 font-mono text-[13px] tracking-[0.06em] uppercase no-underline hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                )
              )}
              <Link
                href="/blog"
                className="text-[#C49A6C] font-mono text-[13px] tracking-[0.06em] uppercase no-underline"
              >
                ← Blog
              </Link>
            </nav>

            <a
              href="tel:7176152613"
              className="bg-[#C49A6C] text-[#1a2530] font-mono text-[11px] tracking-[0.08em] uppercase font-medium px-4 py-2 rounded-sm no-underline whitespace-nowrap"
            >
              (717) 615-2613
            </a>
          </div>
        </header>

        {/* Article header */}
        <div
          className="px-8 py-12 border-b border-[#C49A6C]/20"
          style={{ background: '#2C3E50' }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-1 rounded-sm font-medium"
                style={{ background: bg, color }}
              >
                {post.category}
              </span>
              {post.bilingual && (
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase bg-[#e8f1f8] text-[#2d5f8a] border border-[#bdd4e8] px-2 py-1 rounded-full">
                  ES/EN
                </span>
              )}
            </div>

            <h1
              className="font-bold text-white leading-tight mb-5"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.5rem,4vw,2.25rem)',
              }}
            >
              {post.title}
            </h1>

            <p className="text-white/65 text-base font-light leading-relaxed mb-6">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-5 flex-wrap font-mono text-[11px] tracking-[0.08em] uppercase text-white/50">
              <span>{post.author}</span>
              <span>·</span>
              <span>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>

        {/* Article body */}
        <main className="max-w-3xl mx-auto px-8 py-12">
          <article className="prose-article" dangerouslySetInnerHTML={{ __html: htmlContent }} />

          {/* CTA box */}
          {post.cta && (
            <div className="bg-[#2C3E50] text-white px-10 py-8 rounded-sm mt-10 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex-1">
                <strong className="block text-[1.1rem] font-semibold mb-1">{post.cta}</strong>
                <span className="text-white/65 font-light text-[15px]">
                  No cost. No pressure. Just clarity.
                </span>
              </div>
              <a
                href="tel:7176152613"
                data-cta="article-phone-cta"
                className="bg-[#C49A6C] text-[#1a2530] font-mono text-[11px] tracking-[0.1em] uppercase px-6 py-3 rounded-sm no-underline font-medium whitespace-nowrap"
              >
                (717) 615-2613
              </a>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-8 border-t border-[#e2dcd4]">
            <Link
              href="/blog"
              className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#2C3E50] no-underline hover:underline"
            >
              ← Back to all articles
            </Link>
          </div>
        </main>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="bg-[#f9f6f0] border-t border-[#e2dcd4] px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#6b6460] mb-6">
                More in {post.category}
              </div>
              <div
                className="grid gap-6"
                style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}
              >
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block bg-white border border-[#e2dcd4] rounded-sm p-6 no-underline hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="font-bold text-[#2C3E50] leading-snug mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}
                    >
                      {rel.title}
                    </h3>
                    <p className="text-[13px] text-[#6b6460] leading-relaxed mb-3 line-clamp-2">
                      {rel.excerpt}
                    </p>
                    <span className="font-mono text-[10px] text-[#6b6460]">{rel.readingTime}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-[#1a2530] border-t-2 border-[#C49A6C] px-8 py-8 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="font-mono text-[12px] text-[#C49A6C] mb-3 tracking-[0.08em]">
              #TheBeatGoesOn
            </div>
            <div className="flex gap-6 justify-center flex-wrap mb-4">
              {[
                ['/', 'Home'],
                ['/blog', 'Blog'],
                ['tel:7176152613', '(717) 615-2613'],
                ['mailto:jackson1989@latimorelegacy.com', 'Email'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="text-white/50 font-mono text-[10px] tracking-[0.1em] uppercase no-underline hover:text-white/75 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <p className="text-[12px] text-white/30 leading-relaxed">
              Latimore Life &amp; Legacy LLC · 1544 Route 61 Highway S, Suite 6104, Pottsville, PA
              17901
              <br />
              PA DOI License #1268820 · NIPR #21638507 · Affiliated with Global Financial Impact
              <br />
              Content is for educational purposes only and does not constitute personalized
              financial or insurance advice.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
