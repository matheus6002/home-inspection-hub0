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
    <div className="-mx-4 -mt-6 mb-8 bg-green-800 dark:bg-green-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow">
            <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#166534" strokeWidth="2" fill="white"/>
              <circle cx="20" cy="20" r="5" fill="#166534"/>
              <circle cx="20" cy="20" r="8" stroke="#166534" strokeWidth="1.5" fill="none"/>
              <line x1="20" y1="5"  x2="20" y2="12" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20" y1="28" x2="20" y2="35" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5"  y1="20" x2="12" y2="20" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="28" y1="20" x2="35" y2="20" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9"  y1="9"  x2="14.2" y2="14.2" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="25.8" y1="25.8" x2="31" y2="31" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="31" y1="9"  x2="25.8" y2="14.2" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14.2" y1="25.8" x2="9" y2="31" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 13 L24 17 L24 23 L16 23 L16 17 Z" fill="#166534"/>
              <path d="M18.5 23 L18.5 20 L21.5 20 L21.5 23" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-white">NAVIGATOR HOME INSPECTIONS LLC</p>
            <p className="text-green-200 text-xs leading-tight">Client Portal</p>
          </div>
        </div>
        {client && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-100 hidden sm:block">Hello, {client.name.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
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
