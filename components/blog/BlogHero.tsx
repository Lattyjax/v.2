import Link from 'next/link'

interface Props {
  title: string
  description: string
  category?: string
}

export default function BlogHero({ title, description, category }: Props) {
  return (
    <div className="blog-hero">
      <div className="blog-hero__inner">
        <p className="blog-hero__breadcrumb">
          <Link href="/">Home</Link> &rsaquo; <Link href="/education">Education</Link> &rsaquo; Blog
          {category && <> &rsaquo; {category}</>}
        </p>
        <h1 className="blog-hero__title">
          {title.includes('—') ? (
            <>
              {title.split('—')[0].trim()} —{' '}
              <span>{title.split('—').slice(1).join('—').trim()}</span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="blog-hero__description">{description}</p>
      </div>
    </div>
  )
}
