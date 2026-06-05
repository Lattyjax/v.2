import Link from 'next/link'
import { BRAND } from '@/lib/brand'

export default function DisclosuresPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-[#A9B1BE] hover:text-[#C9A25F] text-sm transition-colors">← Home</Link>
        <h1 className="text-3xl font-bold text-[#F7F7F5] mt-8 mb-2">Disclosures</h1>

        <div className="space-y-6 text-[#A9B1BE] text-sm leading-relaxed mt-6">
          <p><strong className="text-[#F7F7F5]">Licensing:</strong> {BRAND.advisor} is licensed in the Commonwealth of Pennsylvania. PA DOI License #{BRAND.paLicense} · NIPR #{BRAND.nipr}. Insurance products are offered through {BRAND.fullName} LLC, an independent insurance agency.</p>

          <p><strong className="text-[#F7F7F5]">No Guarantees:</strong> Insurance products and features vary by carrier, product, and state. Benefits are not guaranteed and may require the payment of additional premium. We do not guarantee rates, returns, investment performance, or policy approval.</p>

          <p><strong className="text-[#F7F7F5]">Index Products:</strong> Index credits on Indexed Universal Life (IUL) and Fixed Indexed Annuity (FIA) products are not the same as direct participation in any stock market index. They are subject to caps, participation rates, and floors as defined in the policy contract.</p>

          <p><strong className="text-[#F7F7F5]">No Tax or Legal Advice:</strong> Nothing on this website constitutes tax or legal advice. Consult a qualified tax professional or attorney for guidance specific to your situation.</p>

          <p><strong className="text-[#F7F7F5]">Suitability:</strong> Product recommendations are subject to suitability review. Not all products are suitable for all clients. A full needs analysis will be conducted before any recommendation is made.</p>

          <p><strong className="text-[#F7F7F5]">Carrier Independence:</strong> {BRAND.fullName} LLC is an independent agency affiliated with Global Financial Impact. We represent multiple carriers and do not have a quota or obligation to recommend any specific carrier.</p>

          <p><strong className="text-[#F7F7F5]">Contact:</strong> <a href={`mailto:${BRAND.email}`} className="text-[#C9A25F]">{BRAND.email}</a> · {BRAND.phone}</p>
        </div>
      </div>
    </div>
  )
}
