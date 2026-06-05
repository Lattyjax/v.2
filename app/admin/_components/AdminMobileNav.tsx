'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowLeft } from 'lucide-react'
import NotificationCenter from './NotificationCenter'

interface NavItem {
  href: string
  label: string
  icon: string
}

export default function AdminMobileNav({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/8 bg-[#0E1420] px-4 py-3">
        <div>
          <p className="text-xs font-black tracking-[0.35em] text-[#C9A25F]">LATIMORE</p>
          <p className="text-[10px] text-[#A9B1BE]">Hub OS Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-[#A9B1BE] transition hover:bg-white/10 hover:text-white"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Slide-down drawer */}
      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-b border-white/8 bg-[#0E1420] shadow-2xl">
          <nav className="space-y-0.5 px-3 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A9B1BE] transition hover:bg-white/5 hover:text-white"
              >
                <i className={`fa-solid ${item.icon} w-4 text-center text-[#C9A25F]`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/6 px-3 py-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A9B1BE] transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={16} />
              <span>Back to Site</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
