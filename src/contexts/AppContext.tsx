'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { translations, type Lang, type Translations } from '@/lib/i18n'

interface AppContextType {
  lang: Lang
  t: Translations
  toggleLang: () => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType>({} as AppContextType)

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('hi-theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch { return 'light' }
}

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = localStorage.getItem('hi-lang')
    if (saved === 'en' || saved === 'pt') return saved
  } catch {}
  return 'en'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLang(getInitialLang())
    setTheme(getInitialTheme())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('hi-theme', theme)
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('hi-lang', lang)
  }, [lang, mounted])

  function toggleLang() {
    setLang((prev) => (prev === 'en' ? 'pt' : 'en'))
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <AppContext.Provider value={{ lang, t: translations[lang], toggleLang, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
