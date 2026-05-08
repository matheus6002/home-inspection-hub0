'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PortalProvider, usePortal } from '@/contexts/PortalContext'

function PortalHeader() {
  const { client, logout } = usePortal()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/portal')
  }

  return (
    <div className="-mx-4 -mt-6 mb-8 bg-gradient-to-r from-green-900 to-green-800 dark:from-green-950 dark:to-green-900 text-white shadow-lg border-b border-green-700/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <div>
            <p className="font-bold text-sm leading-tight text-white tracking-wide">Navigator Home Inspections LLC</p>
            <p className="text-green-300 text-xs leading-tight opacity-80">Client Portal</p>
          </div>
        </div>
        {client && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-green-100 font-medium">{client.name.split(' ')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-green-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PortalGuard({ children }: { children: React.ReactNode }) {
  const { client, loading } = usePortal()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    const isLoginPage = pathname === '/portal'
    if (!client && !isLoginPage) {
      router.replace('/portal')
    } else if (client && isLoginPage) {
      router.replace('/portal/dashboard')
    }
  }, [client, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <PortalHeader />
      <PortalGuard>
        {children}
      </PortalGuard>
    </PortalProvider>
  )
}
