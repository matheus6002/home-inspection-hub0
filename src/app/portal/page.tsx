'use client'

import { useState } from 'react'
import { usePortal } from '@/contexts/PortalContext'

export default function PortalLoginPage() {
  const { login } = usePortal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await login(email.trim(), password)
      if (!ok) setError('Invalid email or password. Please contact your inspector.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-sm transition'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Branding block */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-700 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
              <circle cx="20" cy="20" r="5" fill="white"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Client Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Navigator Home Inspections LLC</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-5">
          <div>
            <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">Sign in to view your reports</p>
            <p className="text-slate-400 text-xs">Enter the credentials provided by your inspector.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                className={inp}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={inp + ' pr-11'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Need access? Contact{' '}
          <span className="font-medium text-slate-500">Navigator Home Inspections LLC</span>
        </p>
      </div>
    </div>
  )
}
