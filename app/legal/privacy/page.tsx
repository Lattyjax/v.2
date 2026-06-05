import Link from 'next/link'
import { BRAND } from '@/lib/brand'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-[#A9B1BE] hover:text-[#C9A25F] text-sm transition-colors">← Home</Link>
        <h1 className="text-3xl font-bold text-[#F7F7F5] mt-8 mb-2">Privacy Policy</h1>
        <p className="text-[#A9B1BE] text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>

        <div className="prose prose-invert text-[#A9B1BE] space-y-6 text-sm leading-relaxed">
          <p><strong className="text-[#F7F7F5]">{BRAND.fullName} LLC</strong> ("we," "us," or "our") is committed to protecting your privacy. This policy describes what we collect, how we use it, and your choices.</p>

          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">Information We Collect</h2>
          <p>When you contact us, submit a consultation request, or engage with our website, we may collect your name, email address, phone number, county, service interests, appointment preferences, and message details. We also collect technical and usage data such as page views, clicks, referrer data, and session identifiers used for analytics and lead attribution.</p>

          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">How We Use Your Information</h2>
          <p>We use your information to respond to requests, schedule consultations, send follow-up communications, provide requested services, and improve user experience and performance of our website and campaigns. We do not sell your personal information.</p>

          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">Data Processors and Integrations</h2>
          <p>We use third-party service providers to help operate our business, such as website hosting, analytics providers, form processors/webhooks, database and CRM tools, and email delivery services. These providers process information under contractual and technical controls appropriate to their services.</p>


          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">Meta Platforms (Facebook/Instagram) Compliance</h2>
          <p>If you submit your information through ads or landing pages connected to Meta platforms, we process that information only to respond to your request and provide services. We do not use sensitive categories for ad targeting, and we do not sell or share your personal information for unrelated third-party marketing.</p>
          <p>Where used, Meta tools (such as the Meta Pixel or Conversions API) may collect event data (for example page views, form submissions, and campaign attribution) to measure ad performance and improve campaigns. Data handling on Meta platforms is subject to Meta&apos;s own terms and privacy controls. You can manage ad preferences and tracking settings directly in your Meta account.</p>

          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">Data Retention</h2>
          <p>We retain information for as long as needed to provide services, maintain business records, prevent abuse, and comply with legal obligations. Retention periods vary by record type and legal requirements.</p>

          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">Your Rights and Choices</h2>
          <p>You may request access, correction, deletion, or limitation of your personal information by contacting us at <a href={`mailto:${BRAND.email}`} className="text-[#C9A25F]">{BRAND.email}</a>. You may also disable cookies in your browser, though some site features may be affected.</p>

          <h2 className="text-[#F7F7F5] text-lg font-semibold mt-6">Contact</h2>
          <p>{BRAND.fullName} LLC · PA License #{BRAND.paLicense} · <a href={`mailto:${BRAND.email}`} className="text-[#C9A25F]">{BRAND.email}</a></p>
        </div>
      </div>
    </div>
  )
}
