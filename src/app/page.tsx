'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getInspections, deleteInspection, getUnreadReviews, getClients } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import type { Inspection, InspectionSections, Review, Client } from '@/types'

function summarize(sections: InspectionSections) {
  let ok = 0, repair = 0, replace = 0
  for (const section of Object.values(sections)) {
    for (const item of Object.values(section)) {
      if (item.status === 'ok') ok++
      else if (item.status === 'repair') repair++
      else if (item.status === 'replace') replace++
    }
  }
  return { ok, repair, replace }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function getWorstStatus(sections: InspectionSections) {
  let hasReplace = false, hasRepair = false, hasOk = false
  for (const section of Object.values(sections)) {
    for (const item of Object.values(section)) {
      if (item.status === 'replace') hasReplace = true
      else if (item.status === 'repair') hasRepair = true
      else if (item.status === 'ok') hasOk = true
    }
  }
  if (hasReplace) return 'replace'
  if (hasRepair) return 'repair'
  if (hasOk) return 'ok'
  return 'none'
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string
  color: string; icon: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useApp()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [unreadReviews, setUnreadReviews] = useState<Review[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'complete'>('all')

  useEffect(() => {
    Promise.all([getInspections(), getUnreadReviews(), getClients()])
      .then(([insps, reviews, cls]) => {
        setInspections(insps)
        setUnreadReviews(reviews)
        setClients(cls)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return
    setDeletingId(id)
    await deleteInspection(id)
    setInspections((prev) => prev.filter((i) => i.id !== id))
    setDeletingId(null)
  }

  const completedCount = inspections.filter(i => i.status === 'complete').length
  const attentionCount = inspections.filter(i => {
    const w = getWorstStatus(i.sections ?? {})
    return w === 'replace' || w === 'repair'
  }).length

  const filtered = useMemo(() => {
    return inspections.filter(insp => {
      const matchSearch = !search ||
        insp.address?.toLowerCase().includes(search.toLowerCase()) ||
        insp.client_name?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || insp.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [inspections, search, statusFilter])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 dark:from-green-950 dark:via-green-900 dark:to-green-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-200 text-sm font-medium mb-1">{today}</p>
            <h1 className="text-2xl font-bold tracking-tight">Inspection Dashboard</h1>
            <p className="text-green-200 text-sm mt-1 opacity-90">Navigator Home Inspections LLC</p>
          </div>
          <Link
            href="/inspections/new"
            className="bg-white text-green-800 hover:bg-green-50 font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t.newInspection}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inspections"
          value={inspections.length}
          sub={`${completedCount} completed`}
          color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Completed"
          value={completedCount}
          sub={inspections.length ? `${Math.round(completedCount / inspections.length * 100)}% rate` : '—'}
          color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Needs Attention"
          value={attentionCount}
          sub="repair or replace items"
          color="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard
          label="Clients"
          value={clients.length}
          sub={unreadReviews.length > 0 ? `★ ${unreadReviews.length} new review${unreadReviews.length > 1 ? 's' : ''}` : 'no new reviews'}
          color="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by address or client name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
          />
        </div>
        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm gap-1 flex-shrink-0">
          {(['all', 'draft', 'complete'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                statusFilter === f
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'draft' ? t.draft : t.complete}
            </button>
          ))}
        </div>
      </div>

      {/* Inspection list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 && inspections.length === 0 ? (
        <EmptyState t={t} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No inspections match your search</p>
          <button onClick={() => { setSearch(''); setStatusFilter('all') }}
            className="mt-3 text-sm text-green-700 dark:text-green-400 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((insp) => {
            const { ok, repair, replace } = summarize(insp.sections ?? {})
            const worst = getWorstStatus(insp.sections ?? {})
            const isDraft = insp.status === 'draft'
            const unreadReview = unreadReviews.find(r => r.inspection_id === insp.id)
            const total = ok + repair + replace
            const borderColor =
              worst === 'replace' ? 'border-l-red-500' :
              worst === 'repair'  ? 'border-l-amber-500' :
              worst === 'ok'      ? 'border-l-green-500' :
              'border-l-slate-200 dark:border-l-slate-600'

            return (
              <div
                key={insp.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor} p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow`}
              >
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {insp.address || 'No address'}
                    </h2>
                    {unreadReview && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        ★ New Review
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isDraft
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    }`}>
                      {isDraft ? t.draft : t.complete}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{insp.client_name || 'Unknown client'}</span>
                    {' · '}
                    {formatDate(insp.inspection_date)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {ok > 0 && (
                      <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800/50">
                        ✓ {ok} {t.ok}
                      </span>
                    )}
                    {repair > 0 && (
                      <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800/50">
                        ⚠ {repair} {t.needsRepair}
                      </span>
                    )}
                    {replace > 0 && (
                      <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800/50">
                        ✗ {replace} {t.needsReplacement}
                      </span>
                    )}
                    {total === 0 && <span className="text-xs text-slate-400 italic">{t.noItemsAssessed}</span>}
                    {total > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                          {ok > 0 && <div className="bg-green-500 h-full" style={{ width: `${ok/total*100}%` }} />}
                          {repair > 0 && <div className="bg-amber-500 h-full" style={{ width: `${repair/total*100}%` }} />}
                          {replace > 0 && <div className="bg-red-500 h-full" style={{ width: `${replace/total*100}%` }} />}
                        </div>
                        <span className="text-xs text-slate-400">{total} items</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/inspections/${insp.id}/report`}
                    className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-900 border border-green-200 dark:border-green-800 hover:border-green-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.viewReport}
                  </Link>
                  <Link
                    href={`/inspections/${insp.id}`}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.edit}
                  </Link>
                  <button
                    onClick={() => handleDelete(insp.id)}
                    disabled={deletingId === insp.id}
                    className="text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-700 border border-red-100 dark:border-red-900 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
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

function EmptyState({ t }: { t: { noInspectionsYet: string; createFirstInspection: string; createInspection: string } }) {
  return (
    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">{t.noInspectionsYet}</h3>
      <p className="text-slate-400 dark:text-slate-500 mb-8 max-w-xs mx-auto text-sm">{t.createFirstInspection}</p>
      <Link
        href="/inspections/new"
        className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        {t.createInspection}
      </Link>
    </div>
  )
}
