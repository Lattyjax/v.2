import Image from 'next/image'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

interface Props {
  author: string
}

function hasHeadshot(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public/images/blog/jackson-headshot.jpg'))
  } catch {
    return false
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function AuthorBio({ author }: Props) {
  const showHeadshot = hasHeadshot()

  return (
    <div className="author-bio">
      {showHeadshot ? (
        <Image
          src="/images/blog/jackson-headshot.jpg"
          alt={author}
          width={72}
          height={72}
          className="author-bio__avatar"
        />
      ) : (
        <div className="author-bio__initials" aria-label={author}>
          {getInitials(author)}
        </div>
      )}
      <div className="author-bio__info">
        <p className="author-bio__name">{author}</p>
        <p className="author-bio__title">Founder &amp; CEO — Latimore Life &amp; Legacy LLC</p>
        <p className="author-bio__credentials">
          PA Licensed &middot; DOI #1268820 &middot; NIPR #21638507
        </p>
        <Link href="/about" className="author-bio__link">
          About Jackson →
        </Link>
      </div>
    </div>
  )
}
