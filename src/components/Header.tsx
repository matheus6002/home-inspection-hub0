'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export default function Header() {
  const pathname = usePathname()
  const { t, lang, toggleLang, theme, toggleTheme } = useApp()

  if (pathname.startsWith('/portal')) return null

  return (
    <header className="bg-green-800 dark:bg-green-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo + name */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow">
            {/* Ship wheel / house icon in green */}
            <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#166534" strokeWidth="2" fill="white"/>
              {/* Wheel spokes */}
              <circle cx="20" cy="20" r="5" fill="#166534"/>
              <circle cx="20" cy="20" r="8" stroke="#166534" strokeWidth="1.5" fill="none"/>
              {/* 8 spokes */}
              <line x1="20" y1="5"  x2="20" y2="12" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20" y1="28" x2="20" y2="35" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5"  y1="20" x2="12" y2="20" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="28" y1="20" x2="35" y2="20" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9"  y1="9"  x2="14.2" y2="14.2" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="25.8" y1="25.8" x2="31" y2="31" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="31" y1="9"  x2="25.8" y2="14.2" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14.2" y1="25.8" x2="9" y2="31" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              {/* House inside */}
              <path d="M20 13 L24 17 L24 23 L16 23 L16 17 Z" fill="#166534"/>
              <path d="M18.5 23 L18.5 20 L21.5 20 L21.5 23" fill="white"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">{t.appName}</p>
            <p className="text-green-200 text-xs leading-tight">{t.tagline}</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/"
            className="text-green-100 hover:text-white hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            {t.inspections}
          </Link>
          <Link href="/clients"
            className="text-green-100 hover:text-white hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            {t.clients}
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleLang} title="Switch language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {lang === 'en' ? 'PT' : 'EN'}
          </button>

          <button onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-700 hover:bg-green-600 text-white transition-colors">
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
