import NexusAgentClient from './NexusAgentClient'

export const metadata = {
  title: 'Nexus Agent | Latimore Hub OS',
}

const contactLinks = [
  { label: 'Phone', value: '717-615-2613', href: 'tel:7176152613' },
  { label: 'Email', value: 'jackson1989@latimorelegacy.com', href: 'mailto:jackson1989@latimorelegacy.com' },
  { label: 'Website', value: 'www.latimorelifelegacy.com', href: 'https://www.latimorelifelegacy.com' },
  { label: 'Card', value: 'card.latimorelifelegacy.com', href: 'https://card.latimorelifelegacy.com' },
]

export default function NexusAgentPage() {
  return (
    <>
      <section className="px-4 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#C9A25F]/25 bg-[#0E1420]/90 p-4 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A25F]">Latimore Life & Legacy LLC</p>
              <p className="mt-1 text-sm text-[#A9B1BE]">Official contact block for Nexus Agent outputs, CTAs, and client-facing copy.</p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
              {contactLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 transition hover:border-[#C9A25F]/50 hover:bg-[#C9A25F]/10"
                >
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A25F]">{item.label}</span>
                  <span className="mt-1 block font-semibold text-white">{item.value}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      <NexusAgentClient />
    </>
  )
}
