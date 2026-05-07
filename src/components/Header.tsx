'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export default function Header() {
  const pathname = usePathname()
  const { t, lang, toggleLang, theme, toggleTheme } = useApp()

  if (pathname.startsWith('/portal')) return null

  function navClass(href: string) {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return active
      ? 'text-white bg-green-700 dark:bg-green-800 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors'
      : 'text-green-100 hover:text-white hover:bg-green-700/60 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors'
  }

  return (
    <header className="bg-gradient-to-r from-green-900 to-green-800 dark:from-green-950 dark:to-green-900 shadow-lg border-b border-green-700/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
            <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
              <circle cx="20" cy="20" r="5" fill="white"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
              <line x1="20" y1="4"  x2="20" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20" y1="28" x2="20" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4"  y1="20" x2="12" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="28" y1="20" x2="36" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8"  y1="8"  x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              <line x1="26" y1="26" x2="32" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              <line x1="32" y1="8"  x2="26" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              <line x1="14" y1="26" x2="8"  y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-white font-bold text-sm leading-tight tracking-wide">{t.appName}</p>
            <p className="text-green-300 text-xs leading-tight opacity-80">{t.tagline}</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/" className={navClass('/')}>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t.inspections}
            </span>
          </Link>
          <Link href="/clients" className={navClass('/clients')}>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.clients}
            </span>
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-1">
            <Link href="/" className={`p-2 rounded-lg ${pathname === '/' ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-700/60'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Link>
            <Link href="/clients" className={`p-2 rounded-lg ${pathname.startsWith('/clients') ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-700/60'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>

          <div className="w-px h-5 bg-green-600/50 hidden sm:block" />

          <button onClick={toggleLang} title="Switch language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-green-100 text-xs font-bold transition-colors border border-white/10">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {lang === 'en' ? 'PT' : 'EN'}
          </button>

          <button onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-green-100 transition-colors border border-white/10">
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
