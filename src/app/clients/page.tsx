'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClients, deleteClient } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import type { Client } from '@/types'

const AVATAR_COLORS = [
  'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
]

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function ClientsPage() {
  const { t } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getClients().then(setClients).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return
    setDeletingId(id)
    await deleteClient(id)
    setClients(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
  }

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 dark:from-green-950 dark:via-green-900 dark:to-green-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.clientsTitle}</h1>
            <p className="text-green-200 text-sm mt-1">{clients.length} {t.total} · Portal access enabled</p>
          </div>
          <Link href="/clients/new"
            className="bg-white text-green-800 hover:bg-green-50 font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t.newClient}
          </Link>
        </div>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search clients by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-20 animate-pulse" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">{t.noClientsYet}</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 max-w-xs mx-auto">{t.createFirstClient}</p>
          <Link href="/clients/new"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t.addClient}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 font-medium">No clients match your search</p>
          <button onClick={() => setSearch('')} className="mt-2 text-sm text-green-700 dark:text-green-400 hover:underline">Clear</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((client) => {
            const properties = client.properties?.split('\n').filter(Boolean) ?? []
            const avatarColor = getAvatarColor(client.name)
            const initials = client.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={client.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base ${avatarColor}`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">{client.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                      {client.email && (
                        <a href={`mailto:${client.email}`} className="text-sm text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-1 transition-colors">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {client.email}
                        </a>
                      )}
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="text-sm text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-1 transition-colors">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {client.phone}
                        </a>
                      )}
                    </div>
                    {properties.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {properties[0]}
                        {properties.length > 1 && <span className="text-slate-300 dark:text-slate-600"> +{properties.length - 1} more</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {client.portal_password && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/50 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Portal
                    </span>
                  )}
                  <Link href={`/clients/${client.id}`}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors">
                    {t.edit}
                  </Link>
                  <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id}
                    className="text-sm font-medium text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    {t.delete}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
