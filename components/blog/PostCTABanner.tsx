type CTAType = 'consultation' | 'quote' | 'assessment' | 'none'

interface Props {
  type: CTAType
}

const VARIANTS: Record<Exclude<CTAType, 'none'>, { title: string; body: string; btn: string; href: string }> = {
  consultation: {
    title: "Let's Talk — Free Consultation",
    body: "No obligation, no pressure. A 20-minute conversation can give you more clarity than hours of research.",
    btn: "Book Your Free Consultation",
    href: "/book",
  },
  quote: {
    title: "Get a Quick Term Life Quote",
    body: "See your rates in minutes. No health exam required for many applicants.",
    btn: "Get My Quote Now",
    href: "https://agents.ethoslife.com/invite/29ad1",
  },
  assessment: {
    title: "Take Our 2-Minute Needs Assessment",
    body: "Answer a few simple questions and get a personalized protection plan recommendation.",
    btn: "Start the Assessment",
    href: "https://latimorelifelegacy.fillout.com/pahs",
  },
}

export default function PostCTABanner({ type }: Props) {
  if (type === 'none') return null

  const v = VARIANTS[type]
  const isExternal = v.href.startsWith('http')

  return (
    <div className="post-cta-banner">
      <p className="post-cta-banner__title">{v.title}</p>
      <p className="post-cta-banner__body">{v.body}</p>
      <a
        href={v.href}
        className="post-cta-banner__btn"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {v.btn}
      </a>
    </div>
  )
}
