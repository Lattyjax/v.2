import { BRAND } from '@/lib/brand'

const BASE_URL = BRAND.baseUrl
const BOOKING_LINK = BRAND.bookingUrl.startsWith('http')
  ? BRAND.bookingUrl
  : `${BASE_URL}${BRAND.bookingUrl}`

export function InquiryNotification(p: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  productInterest?: string
  county?: string
  leadSessionId?: string
  source?: string
  campaign?: string
}) {
  const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email || p.phone || 'New Lead'
  return `
  <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0B0F17">
    <div style="background:#0B0F17;padding:24px 32px;border-radius:8px 8px 0 0">
      <h2 style="color:#C9A25F;margin:0;font-size:18px;letter-spacing:0.1em">LATIMORE LIFE & LEGACY</h2>
      <p style="color:#A9B1BE;margin:4px 0 0;font-size:12px">#TheBeatGoesOn — New Lead Captured</p>
    </div>
    <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <h3 style="margin:0 0 16px;font-size:20px">New Lead: ${name}</h3>
      <table style="width:100%;border-collapse:collapse">
        ${p.email ? `<tr><td style="padding:8px 0;color:#6b7280;width:140px">Email</td><td style="padding:8px 0;font-weight:600">${p.email}</td></tr>` : ''}
        ${p.phone ? `<tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0;font-weight:600">${p.phone}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#6b7280">Interest</td><td style="padding:8px 0"><span style="background:#C9A25F;color:#0B0F17;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700">${p.productInterest ?? 'General'}</span></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">County</td><td style="padding:8px 0">${p.county ?? '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Source</td><td style="padding:8px 0">${p.source ?? '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Campaign</td><td style="padding:8px 0">${p.campaign ?? '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Session ID</td><td style="padding:8px 0;font-size:11px;color:#9ca3af">${p.leadSessionId ?? '—'}</td></tr>
      </table>
      <div style="margin-top:24px">
        <a href="${BASE_URL}/admin" style="background:#0B0F17;color:#C9A25F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">View in LatimoreHub Admin →</a>
      </div>
    </div>
  </div>`
}

export function ThankYou(p: { firstName?: string }) {
  const first = p.firstName ? ` ${p.firstName}` : ''
  return `
  <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0B0F17">
    <div style="background:#0B0F17;padding:24px 32px;border-radius:8px 8px 0 0">
      <h2 style="color:#C9A25F;margin:0;font-size:18px;letter-spacing:0.1em">LATIMORE LIFE & LEGACY</h2>
      <p style="color:#A9B1BE;margin:4px 0 0;font-size:12px">Protecting Today. Securing Tomorrow.</p>
    </div>
    <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <p>Hi${first},</p>
      <p>Thanks for reaching out to Latimore Life & Legacy. We received your request and will follow up within 24 hours.</p>
      <p>If you'd like to choose a time now, you can book directly below:</p>
      <div style="margin:24px 0">
        <a href="${BOOKING_LINK}" style="background:#C9A25F;color:#0B0F17;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px">Book a 30-Minute Consultation →</a>
      </div>
      <p style="color:#6b7280;font-size:13px">No pressure. No jargon. Just a clear conversation about what matters to you.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="font-size:12px;color:#9ca3af">${'#TheBeatGoesOn'} — Jackson M. Latimore Sr.<br>Latimore Life & Legacy LLC | PA License #1268820</p>
    </div>
  </div>`
}
