'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClients, deleteClient } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import type { Client } from '@/types'

export default function ClientsPage() {
  const { t } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.clientsTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{clients.length} {t.total}</p>
        </div>
        <Link href="/clients/new"
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.newClient}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.noClientsYet}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t.createFirstClient}</p>
          <Link href="/clients/new"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg inline-block transition-colors">
            {t.addClient}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 dark:text-green-300 font-bold text-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{client.name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {client.email && (
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {client.phone}
                      </span>
                    )}
                  </div>
                  {client.properties && (
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      🏠 {client.properties.split('\n').filter(Boolean)[0]}
                      {client.properties.split('\n').filter(Boolean).length > 1 && ` +${client.properties.split('\n').filter(Boolean).length - 1} more`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/clients/${client.id}`}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors">
                  {t.edit}
                </Link>
                <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id}
                  className="text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
