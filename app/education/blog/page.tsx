import { getAllPosts, getFeaturedPosts, BLOG_CATEGORIES } from '@/lib/blog'
import { NewBlogCard } from '@/components/blog/BlogCard'
import BlogHero from '@/components/blog/BlogHero'
import BlogSidebar from '@/components/blog/BlogSidebar'
import Link from 'next/link'
import { SiteHeader, SiteFooter, DEFAULT_NAV_LINKS } from '@/app/_components/site-shell'
import '@/styles/blog.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Financial Education Blog | Latimore Life & Legacy',
  description: 'Plain-language guides on life insurance, annuities, estate planning, and financial literacy from a Pennsylvania licensed advisor.',
}

interface SearchParams {
  category?: string
  tag?: string
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { category, tag } = params

  const allPosts = getAllPosts()
  const featured = getFeaturedPosts()

  let posts = allPosts
  if (category) {
    posts = allPosts.filter((p) => p.category === category)
  } else if (tag) {
    posts = allPosts.filter((p) => p.tags.includes(tag))
  }

  const showFeatured = !category && !tag && featured.length > 0

  const heroTitle = category
    ? `${category} — Articles`
    : tag
    ? `Tagged: ${tag}`
    : 'Financial Education Blog'
  const heroDesc = category
    ? `Plain-language articles on ${category.toLowerCase()} from a PA licensed advisor.`
    : 'Honest, plain-language financial guidance — no jargon, no hidden agendas.'

  return (
    <>
      <SiteHeader currentPath="/education/blog" navLinks={DEFAULT_NAV_LINKS} />
      <main>
        <BlogHero title={heroTitle} description={heroDesc} category={category} />

        <div style={{ background: '#f9fafb' }}>
          <div className="blog-page-wrapper">
            {/* Main content */}
            <div>
              {/* Category filter pills */}
              <div className="category-filters">
                <Link
                  href="/education/blog"
                  className={`category-filters__pill${!category && !tag ? ' category-filters__pill--active' : ''}`}
                >
                  All
                </Link>
                {BLOG_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/education/blog?category=${encodeURIComponent(cat)}`}
                    className={`category-filters__pill${category === cat ? ' category-filters__pill--active' : ''}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              {/* Featured strip */}
              {showFeatured && (
                <div className="featured-section">
                  <p className="featured-section__label">⭐ Featured Articles</p>
                  <div className="featured-section__grid">
                    {featured.map((post) => (
                      <NewBlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {/* Main grid */}
              {posts.length > 0 ? (
                <div className="blog-grid">
                  {posts
                    .filter((p) => showFeatured ? !p.featured : true)
                    .map((post) => (
                      <NewBlogCard key={post.slug} post={post} />
                    ))}
                </div>
              ) : (
                <div className="blog-empty">
                  <div className="blog-empty__icon">📭</div>
                  <p className="blog-empty__title">No articles found</p>
                  <p>
                    <Link href="/education/blog">View all articles</Link>
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="blog-page-wrapper__sidebar">
              <BlogSidebar
                categories={[...BLOG_CATEGORIES]}
                currentCategory={category}
                currentTag={tag}
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
