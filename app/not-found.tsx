import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[#C9A25F] font-black tracking-widest text-sm mb-4">LATIMORE LIFE & LEGACY</p>
      <h1 className="text-5xl font-black text-[#F7F7F5] mb-3">404</h1>
      <p className="text-[#A9B1BE] text-lg mb-8">Page not found.</p>
      <Link href="/" className="px-8 py-4 bg-[#C9A25F] text-[#0B0F17] rounded-full font-bold text-sm hover:brightness-110 transition-all">
        Return Home
      </Link>
    </div>
  )
}
