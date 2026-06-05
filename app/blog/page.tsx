import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getAllPosts, getFeaturedPost, type Post } from '@/lib/mdx'
import CategoryFilter from '@/app/_components/category-filter'

export const metadata: Metadata = {
  title: 'Blog — Insurance & Retirement Guides | Latimore Life & Legacy',
  description:
    'Plain-language guides on life insurance, retirement income, and legacy planning for Coal Region PA families and school districts. Written by Jackson M. Latimore Sr.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'The Latimore Hub — Real Talk on Life Insurance & Retirement',
    description:
      'Education-first financial guidance for Schuylkill, Luzerne, and Northumberland County families.',
    url: '/blog',
    type: 'website',
  },
}

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

function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group bg-[#2C3E50] rounded-sm overflow-hidden mb-12 no-underline"
      style={{ textDecoration: 'none' }}
    >
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-1 rounded-sm font-medium"
            style={{
              background: TRACK_BG[post.category] ?? '#e8f1f8',
              color: TRACK_COLOR[post.category] ?? '#2d5f8a',
            }}
          >
            {post.category}
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#C49A6C]">
            Featured
          </span>
        </div>

        <h2
          className="font-serif text-[1.75rem] md:text-[2.25rem] font-bold text-white leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {post.title}
        </h2>

        <p className="text-white/65 text-base font-light leading-relaxed mb-6 max-w-2xl">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-white/50">
            {post.readingTime}
          </span>
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-white/50">
            {post.author}
          </span>
          <span
            className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#2C3E50] bg-[#C49A6C] px-4 py-2 rounded-sm ml-auto"
          >
            Read Article →
          </span>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ post, index }: { post: Post; index: number }) {
  const color = TRACK_COLOR[post.category] ?? '#2d5f8a'
  const bg = TRACK_BG[post.category] ?? '#e8f1f8'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col bg-white border border-[#e2dcd4] rounded-sm overflow-hidden no-underline hover:shadow-md transition-shadow"
      style={{ textDecoration: 'none', animationDelay: `${index * 0.05}s` }}
    >
      <div className="h-[3px]" style={{ background: color }} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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
          {post.kpi && (
            <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-[#C49A6C] bg-[#fdf6ee] px-2 py-1 rounded-full ml-auto">
              {post.kpi}
            </span>
          )}
        </div>

        <h3
          className="font-bold text-[#2C3E50] leading-snug mb-3 flex-1"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}
        >
          {post.title}
        </h3>

        <p className="text-[14px] text-[#6b6460] leading-relaxed mb-5">{post.excerpt}</p>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2dcd4] bg-[#f9f6f0]">
        <span className="font-mono text-[10px] text-[#6b6460]">{post.readingTime}</span>
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#2C3E50] border border-[#2C3E50] px-3 py-[5px] rounded-sm">
          Read →
        </span>
      </div>
    </Link>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const allPosts = getAllPosts()
  const featured = getFeaturedPost()
  const posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts

  const nonFeatured = posts.filter((p) => !p.featured || category)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');
        .blog-root { font-family:'Source Serif 4',Georgia,serif; }
      `}</style>

      <div className="blog-root min-h-screen bg-[#f9f6f0] text-[#1a1a1a]">
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
                Blog
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

        {/* Hero */}
        <section
          className="px-8 py-20 border-b border-[#C49A6C]/25"
          style={{
            background:
              'radial-gradient(ellipse at 80% 20%,rgba(196,154,108,0.12) 0%,transparent 60%), radial-gradient(ellipse at 10% 90%,rgba(196,154,108,0.08) 0%,transparent 50%), #2C3E50',
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-5 font-mono text-[11px] tracking-[0.18em] uppercase text-[#C49A6C]">
              <span className="block w-8 h-px bg-[#C49A6C]" />
              Financial Education · Coal Region PA
            </div>
            <h1
              className="font-black text-white leading-tight mb-6 max-w-2xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem,5vw,3.5rem)',
              }}
            >
              Real talk on life insurance,
              <br />
              retirement, and{' '}
              <em className="text-[#C49A6C] italic">leaving something behind</em>.
            </h1>
            <p className="text-white/65 max-w-xl text-[17px] font-light leading-relaxed mb-10">
              Plain-language guides written by Jackson Latimore — an independent broker and cardiac
              arrest survivor who understands exactly what&apos;s at stake when there&apos;s no plan
              in place.
            </p>
            <div className="flex gap-10 flex-wrap border-t border-[#C49A6C]/20 pt-8">
              {[
                [String(allPosts.length), 'Articles Published'],
                ['3', 'Audience Tracks'],
                ['3', 'Counties Served'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    className="text-[#C49A6C] leading-none"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '2.25rem',
                      fontWeight: 700,
                    }}
                  >
                    {n}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/50 mt-1">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-8 py-14">
          {/* Featured (only when no filter active) */}
          {!category && featured && <FeaturedCard post={featured} />}

          {/* Category filter */}
          <Suspense>
            <CategoryFilter />
          </Suspense>

          {/* Grid */}
          {nonFeatured.length === 0 ? (
            <p className="text-[#6b6460] text-center py-16 font-mono text-sm">
              No articles in this category yet.
            </p>
          ) : (
            <div className="grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
              {nonFeatured.map((post, i) => (
                <ArticleCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          )}
        </main>

        {/* Author strip */}
        <div className="bg-[#1a2530] border-y border-[#C49A6C]/20 px-8 py-12 my-8">
          <div className="max-w-6xl mx-auto flex items-center gap-10 flex-wrap">
            <div className="w-18 h-18 rounded-full bg-[#C49A6C] flex items-center justify-center shrink-0 text-[#1a2530] font-black text-2xl"
              style={{ fontFamily: "'Playfair Display', serif", width: 72, height: 72 }}>
              JL
            </div>
            <div className="flex-1">
              <div
                className="text-white text-xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Jackson M. Latimore Sr.
              </div>
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#C49A6C] my-1">
                Founder &amp; CEO · Latimore Life &amp; Legacy LLC · PA DOI #1268820
              </div>
              <p className="text-white/65 text-[15px] font-light leading-relaxed max-w-2xl">
                In December 2010, I collapsed on the basketball court at East Stroudsburg
                University. My heart stopped. An AED funded by the Gregory W. Moyer
                Defibrillator Fund brought me back. That question — what would have happened
                to the people who depended on me if I had not survived — drives everything I
                do.
              </p>
              <span className="font-mono text-[12px] text-[#C49A6C] mt-2 block tracking-[0.08em]">
                #TheBeatGoesOn · Affiliated with Global Financial Impact (GFI)
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-6xl mx-auto px-8 mb-12">
          <div className="bg-[#fdf6ee] border border-[#e8d5b8] rounded-sm p-12 text-center">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#C49A6C] mb-3">
              No cost. No pressure. Just clarity.
            </div>
            <h2
              className="text-[#2C3E50] text-[2rem] font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to close the gap?
            </h2>
            <p className="text-[#6b6460] max-w-lg mx-auto text-base mb-8">
              Schedule a free 20-minute protection review. We look at what you have, what you
              owe, and what your family would actually need.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="tel:7176152613"
                data-cta="phone-cta"
                className="bg-[#2C3E50] text-white font-mono text-[12px] tracking-[0.1em] uppercase px-7 py-4 rounded-sm no-underline"
              >
                (717) 615-2613 — Call Now
              </a>
              <a
                href="mailto:jackson1989@latimorelegacy.com"
                data-cta="email-cta"
                className="border border-[#2C3E50] text-[#2C3E50] font-mono text-[12px] tracking-[0.1em] uppercase px-7 py-4 rounded-sm no-underline"
              >
                Email Jackson
              </a>
            </div>
          </div>
        </div>

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
