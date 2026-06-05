interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  headings: Heading[]
}

export default function TableOfContents({ headings }: Props) {
  if (headings.length === 0) return null

  return (
    <div className="blog-sidebar__card">
      <h3>In This Article</h3>
      <ul className="toc">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'toc--h3' : ''}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
