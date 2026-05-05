'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { portalLogin } from '@/lib/supabase'
import type { Client } from '@/types'

interface PortalContextType {
  client: Client | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const PortalContext = createContext<PortalContextType>({} as PortalContextType)
const STORAGE_KEY = 'hi-portal-client'

export function PortalProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setClient(JSON.parse(saved))
    } catch {}
    setLoading(false)
  }, [])

  async function login(email: string, password: string): Promise<boolean> {
    const result = await portalLogin(email, password)
    if (result) {
      setClient(result)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
      return true
    }
    return false
  }

  function logout() {
    setClient(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <PortalContext.Provider value={{ client, loading, login, logout }}>
      {children}
    </PortalContext.Provider>
  )
}

export function usePortal() {
  return useContext(PortalContext)
}
