'use client'

const FORM_URL = 'https://latimorelifelegacy.fillout.com/latimorelifelegacy'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

export default function ConsultationButton({
  label = 'Start Your Protection Review',
}: {
  label?: string
}) {
  function handleClick() {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'ConsultationFormClick', {
        form_name: 'Latimore Life Legacy Fillout',
        destination: FORM_URL,
      })
    }
  }

  return (
    <a
      href={FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-xl bg-[#C9A25F] px-6 py-3 font-semibold text-[#101827] shadow-md transition hover:opacity-90"
    >
      {label}
    </a>
  )
}
