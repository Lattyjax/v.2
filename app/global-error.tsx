'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[LatimoreHub Error]', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[#C9A25F] font-black tracking-widest text-sm mb-4">LATIMORE LIFE & LEGACY</p>
        <h1 className="text-3xl font-bold text-[#F7F7F5] mb-3">Something went wrong.</h1>
        <p className="text-[#A9B1BE] max-w-md mb-8">
          We hit an unexpected error. Please try again or contact us directly.
        </p>
        <div className="flex gap-4">
          <button onClick={reset} className="px-6 py-3 bg-[#C9A25F] text-[#0B0F17] rounded-full font-bold text-sm hover:brightness-110 transition-all">
            Try Again
          </button>
          <Link href="/" className="px-6 py-3 border border-[#F7F7F5]/20 text-[#F7F7F5] rounded-full font-bold text-sm hover:bg-[#F7F7F5]/5 transition-all">
            Go Home
          </Link>
        </div>
        {error.digest && <p className="text-[#A9B1BE]/30 text-xs mt-8">Error ID: {error.digest}</p>}
      </body>
    </html>
  )
}
